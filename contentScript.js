console.log('Lux AI Helper script running');

function getDialog() {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  return params.get('dialog');
}

const prefix = 'episodes-submission-';

const helperFormat = 'Format: teamId (score) reward.';

function showNotice(id, retryCount) {
  console.log('Retrieving data for episode id', id, 'retryCount', retryCount);

  // #site-content > div.sc-hGtivm.czsNwd.competition > div > div:nth-child(2) > div.sc-iTONeN.gHfYrC.sc-mTeDU.ipTExk.mdc-dialog.mdc-dialog--open > div.mdc-dialog__container > div > div > h2

  // #kaggle-portal-root-global > div > div.MuiDialog-container.MuiDialog-scrollPaper.css-ekeie0 > div > div > h2
  const headerItemElem = document.querySelector(
    '#kaggle-portal-root-global > div > div.MuiDialog-container.MuiDialog-scrollPaper > div > div > h2'
  );

  // console.log('headerItemElem', headerItemElem);

  if (headerItemElem) {
    headerItemElem.insertAdjacentHTML(
      'afterend',
      `<span id="lux-helper-status">Lux Helper fetching data...</span>`
    );
    fetchData(id);
  } else if (retryCount > 0) {
    // try again in 1 second
    setTimeout(() => {
      showNotice(id, retryCount - 1);
    }, 1000);
  }
}

function fetchData(id) {
  // fetch data from https://www.kaggle.com/api/i/competitions.EpisodeService/ListEpisodes using post with body: {submissionId: $id}
  fetch(
    'https://www.kaggle.com/api/i/competitions.EpisodeService/ListEpisodes',
    {
      method: 'POST',
      body: JSON.stringify({ submissionId: id, ids: [] }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log('Success:', data);
      const episodes = data.episodes;

      // map submission id to name
      const teamIdNameMap = {};
      const teams = data.teams;
      teams.forEach((team) => {
        teamIdNameMap[team.id] = team.teamName;
      });

      const submissionIdNameMap = {};
      const submissions = data.submissions;
      submissions.forEach((submission) => {
        const teamId = submission.teamId;
        submissionIdNameMap[submission.id] = teamIdNameMap[teamId] || 'Unknown';
      });

      const listItem = document.querySelector(
        '#kaggle-portal-root-global > div > div.MuiDialog-container.MuiDialog-scrollPaper div > ul.MuiList-root'
      );

      const listItemElems = listItem.querySelectorAll('li > div');

      const totalCount = listItemElems.length > 10 ? 10 : listItemElems.length;
      const winMap = {};

      for (let i = 0; i < listItemElems.length; i++) {
        const element = listItemElems[i];
        const content = element.innerHTML;
        const episode = episodes[i];
        const agent1 = episode.agents[0];
        const agent2 = episode.agents[1];
        const id = episode.id;
        const team1 = submissionIdNameMap[agent1.submissionId];
        const team2 = submissionIdNameMap[agent2.submissionId];
        const score1 = agent1.initialScore || 0;
        const score2 = agent2.initialScore || 0;
        const reward1 = agent1.reward || 0;
        const reward2 = agent2.reward || 0;
        const team1Won = reward1 >= reward2;
        if (i < totalCount) {
          if (team1Won) {
            winMap[team1] = (winMap[team1] || 0) + 1;
          } else {
            winMap[team2] = (winMap[team2] || 0) + 1;
          }
        }
        const team1ScoreText = team1Won
          ? `<span class="lux-helper-bold">${team1} (${score1.toFixed(
              0
            )}) ${reward1.toFixed(0)}</span>`
          : `${team1} (${score1.toFixed(0)}) ${reward1.toFixed(0)}`;
        const team2ScoreText = team1Won
          ? `${team2} (${score2.toFixed(0)}) ${reward2.toFixed(0)}`
          : `<span class="lux-helper-bold">${team2} (${score2.toFixed(
              0
            )}) ${reward2.toFixed(0)}</span>`;
        const scoreText = `${team1ScoreText}<br>${team2ScoreText}`;
        // const link = `https://jmerle.github.io/lux-eye-2022/visualizer?input=${id}`;
        // https://s2vis.lux-ai.org/#/?input=46158219
        const link = `https://s3vis.lux-ai.org/#/?input=${id}`;
        element.insertAdjacentHTML(
          'beforeend',
          `<span class="lux-helper-block">${scoreText}<br><a href="${link}" target="_blank">Lux Eye</a></span>`
        );
      }

      // update status
      let winArray = [];
      for (const [key, value] of Object.entries(winMap)) {
        winArray.push({ name: key, count: value });
      }
      winArray.sort((a, b) => b.count - a.count);
      let winStats = '<br>Last 10 game wins: ';
      winArray.forEach((item, i) => {
        if (i > 0) {
          winStats += ' | ';
        }
        winStats += `${item.name}: ${item.count}`;
      });

      const statusElem = document.querySelector('#lux-helper-status');
      if (statusElem) {
        statusElem.innerHTML = `Lux Helper fetch complete. ${helperFormat} ${winStats}`;
      } else {
        // try again in 1 second
        setTimeout(() => {
          const statusElem = document.querySelector('#lux-helper-status');
          if (statusElem) {
            statusElem.innerHTML = `Lux Helper fetch complete. ${helperFormat}`;
          }
        }, 1000);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

runScript();

function listenToClick(elements) {
  if (elements && elements.length > 0) {
    console.log('attaching click listener to user elements');
    // trigger when user element is clicked
    elements.forEach((elm) => {
      if (elm.innerHTML === 'live_tv') {
        // set background color to green
        elm.style.backgroundColor = 'green';
        elm.addEventListener('click', function () {
          setTimeout(() => {
            runScript();
          }, 500);
        });
      }
    });
  }
}

function tryAttachListener() {
  // #site-content > div.sc-hbjaKc.jCsmA-d.competition > div > div:nth-child(2) > div:nth-child(5) > ul > li:nth-child(8) > div.sc-olbas.hBwZaf.sc-KiOns.dvKhsD > span.sc-ikZpkk.sc-jIZahH.sc-cyxtte.fEheNQ.dRBIQl.ekyQpa > i
  // #user_row > li > div > span.sc-ikZpkk.sc-jIZahH.sc-cyxtte.fEheNQ.dRBIQl.ekyQpa > i
  // #site-content > div.sc-hGtivm.czsNwd.competition > div > div:nth-child(2) > div:nth-child(6) > ul > li:nth-child(5) > div.sc-ckMVTt.cCcqLX.sc-gzMtdX.irWGqS > span.sc-ivTmOn.sc-cxabCf.sc-BHInz.fKyDVD.hvJMqH.bEweKS > i

  // #site-content > div:nth-child(2) > div > div > div.sc-evXUun.jFjTYt > div.sc-EBWJC.eDLtzp > div:nth-child(4) > ul > li:nth-child(1) > div > a > div.sc-jrzWqq.iespTy > span
  const userElements = document.querySelectorAll(
    '#site-content div.competition li > div > a > div > span.google-symbols'
  );
  if (userElements && userElements.length) {
    listenToClick(userElements);
    return true;
  } else {
    // #site-content > div.sc-hbjaKc.jCsmA-d.competition > div > div.sc-fnheHR.iLvLBA > div.sc-efUWQm.itlQwP > div:nth-child(4) > ul > li:nth-child(1) > div > a > div.sc-geFwrG.llqHmP > i
    // #site-content > div.sc-hbjaKc.jCsmA-d.competition > div > div.sc-fnheHR.iLvLBA > div.sc-efUWQm.itlQwP > div:nth-child(4) > ul > li:nth-child(4) > div > a > div.sc-geFwrG.llqHmP > i
    // #site-content > div:nth-child(2) > div > div > div.sc-kJyDer.gxcKTX > div:nth-child(5) > ul > li:nth-child(2) > div > span.sc-eUlrpB.sc-goKQVP.dpOfYN.iOkicb > span
    const submissionElements = document.querySelectorAll(
      '#site-content div.competition > div > div ul li.MuiListItem-root > div > span > span.google-symbols'
    );
    if (submissionElements && submissionElements.length) {
      listenToClick(submissionElements);
      return true;
    }
  }
  return false;
}

setTimeout(() => {
  const success = tryAttachListener();
  if (!success) {
    // try again in 2s
    setTimeout(() => {
      tryAttachListener();
    }, 2000);
  }
}, 1000);

function runScript() {
  const dialog = getDialog();
  console.log('dialog', dialog);
  if (dialog && dialog.includes(prefix)) {
    const id = dialog.replace(prefix, '');
    showNotice(id, 5);
  }
}

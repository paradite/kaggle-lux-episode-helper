console.log('Lux AI Helper script running');

function getDialog() {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  return params.get('dialog');
}

const prefix = 'episodes-submission-';

const helperFormat = 'Format: teamId (score) reward.';

function showNotice(id) {
  console.log('Retrieving data for episode id', id);

  const headerItemElem = document.querySelector(
    '#site-content > div.competition > div > div:nth-child(2) > div.mdc-dialog.mdc-dialog--open > div.mdc-dialog__container > div > div:nth-child(2) > h2'
  );

  if (headerItemElem) {
    headerItemElem.insertAdjacentHTML(
      'afterend',
      `<span class="lux-helper-block" id="lux-helper-status">Lux Helper fetching data...</span>`
    );
  } else {
    // try again in 1 second
    setTimeout(() => {
      const headerItemElem = document.querySelector(
        '#site-content > div.competition > div > div:nth-child(2) > div.mdc-dialog.mdc-dialog--open > div.mdc-dialog__container > div > div:nth-child(2) > h2'
      );
      if (headerItemElem) {
        headerItemElem.insertAdjacentHTML(
          'afterend',
          `<span class="lux-helper-block" id="lux-helper-status">Lux Helper fetching data...</span>`
        );
      }
    }, 1000);
  }
}

function append(id) {
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
        '#site-content > div.competition > div > div:nth-child(2) > div.mdc-dialog.mdc-dialog--open'
      );

      const listItemElems = listItem.querySelectorAll('li > div');

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
        const link = `https://s2vis.lux-ai.org/#/?input=${id}`;
        element.insertAdjacentHTML(
          'beforeend',
          `<span class="lux-helper-block">${scoreText}<br><a href="${link}" target="_blank">Lux Eye</a></span>`
        );
      }

      // update status
      const statusElem = document.querySelector('#lux-helper-status');
      if (statusElem) {
        statusElem.innerHTML = `Lux Helper fetch complete. ${helperFormat}`;
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
  const userElements = document.querySelectorAll(
    '#site-content > div.competition li > div > span > i.rmwc-icon'
  );
  if (userElements && userElements.length) {
    listenToClick(userElements);
    return true;
  } else {
    // #site-content > div.sc-hbjaKc.jCsmA-d.competition > div > div.sc-fnheHR.iLvLBA > div.sc-efUWQm.itlQwP > div:nth-child(4) > ul > li:nth-child(1) > div > a > div.sc-geFwrG.llqHmP > i
    // #site-content > div.sc-hbjaKc.jCsmA-d.competition > div > div.sc-fnheHR.iLvLBA > div.sc-efUWQm.itlQwP > div:nth-child(4) > ul > li:nth-child(4) > div > a > div.sc-geFwrG.llqHmP > i
    const submissionElements = document.querySelectorAll(
      '#site-content > div.competition > div > div ul.km-list > li > div > a > div > i.rmwc-icon'
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
    setTimeout(() => showNotice(id), 1000);
    // delay 2 seconds to wait for the dialog to load
    setTimeout(() => append(id), 2000);
  }
}

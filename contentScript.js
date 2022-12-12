console.log('Lux AI Helper script running');

function getDialog() {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  return params.get('dialog');
}

const prefix = 'episodes-submission-';

function showNotice(id) {
  console.log('Retrieving data for episode id', id);

  const headerItemElem = document.querySelector(
    '#site-content > div.competition > div > div:nth-child(2) > div.mdc-dialog.mdc-dialog--open > div.mdc-dialog__container > div > div:nth-child(2) > h2'
  );

  headerItemElem.insertAdjacentHTML(
    'afterend',
    '<span class="lux-helper-block" id="lux-helper-status">Lux Helper fetching data...</span>'
  );
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

      const listItem = document.querySelector(
        '#site-content > div.competition > div > div:nth-child(2) > div.mdc-dialog.mdc-dialog--open'
      );

      const listItemElems = listItem.querySelectorAll('li');

      for (let i = 0; i < listItemElems.length; i++) {
        const element = listItemElems[i];
        const content = element.innerHTML;
        const episode = episodes[i];
        const agent1 = episode.agents[0];
        const agent2 = episode.agents[1];
        const id = episode.id;
        const scoreText = `${agent1.initialScore.toFixed(
          0
        )} vs ${agent2.initialScore.toFixed(0)} `;
        const link = `https://jmerle.github.io/lux-eye-2022/visualizer?input=${id}`;
        element.insertAdjacentHTML(
          'beforeend',
          `<span class="lux-helper-block">${scoreText}<a href="${link}" target="_blank">Lux Eye</a></span>`
        );
      }

      // update status
      const statusElem = document.querySelector('#lux-helper-status');
      statusElem.innerHTML = 'Lux Helper fetch complete.';
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
    // try again in 1s
    setTimeout(() => {
      tryAttachListener();
    }, 1000);
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

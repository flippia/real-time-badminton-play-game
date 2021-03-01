const expectedShotArea = document.querySelector('.expectedShotArea');
const Dropdown = document.querySelector('.expectedShotDropdown');
const Dropdowns = Array.from(Dropdown.children);
const showProbabilities = document.querySelector('.showProbabilities');
const userName = document.querySelector('.user');
// const img = document.querySelector('img');
const topImg = document.querySelector('.top');
const botImg = document.querySelector('.bot');
const probability = document.querySelector('.probability');

const userA = document.querySelector('.usera');
const userB = document.querySelector('.userb');
const scoreA = document.querySelector('.scoreA');
const scoreB = document.querySelector('.scoreB');
const scoreReason = document.querySelector('.scoreReason');
const dropPoint = document.querySelector('.dropPoint');
const start = document.querySelector('.start');
const agree = document.querySelector('.agree');
const hit = document.querySelector('.hit');
const hitback = document.querySelector('.hit-back');

// set the function to stop real-time listeners
let unsubidUser, unsubball;

// values to help ensure 1st hit and 1st hitback
let pitch = 1, activeHitBack = 0;

// most rounds can be played before err
const round = 99;

// expected shot area from person
let expectedShot;

// dropdown function
expectedShotArea.addEventListener('click', () => {
    // delete last probability display
    probability.innerHTML = '';
    Dropdown.classList.toggle('active');
});

// hover a li tag to show a related image
Dropdowns.forEach((li, index) => {
    li.addEventListener('mouseover', () => {
        topImg.setAttribute('src', `img/top${index + 1}.bmp`);
    });
});

// choose expected shot area
Dropdown.addEventListener('click', e => {
    expectedShot = e.target.innerText[5];
    const now = new Date();
    const lastChosenExpectedShot = {
        expectedShot: e.target.innerText[5],
        created_at: firebase.firestore.Timestamp.fromDate(now)
    };    
    db.collection('AreaWanted').add(lastChosenExpectedShot).then();
});

// show probabilities
// code should be equal to 'hit' or 'hitback' part
// issue: set browser B's pitch = 0 somewhere (inside 'ball')
showProbabilities.addEventListener('click', () => {
    if(pitch === 1){
        if(expectedShot){
            downloadData('easy1to' + expectedShot)
                .then(snapshot => snapshot.docs.forEach(doc => probaUI(doc.data())))
                .catch(err => console.log(err));
        } else {
            console.log('please choose shot area first!');
        }
    } else {
        if(expectedShot){
            db.collection('AreaPlayAt').orderBy('created_at').get()
                .then(snapshot => {
                    return downloadData(snapshot.docs.reverse()[0].data().shotFrom + 'to' + expectedShot);
                })
                .then(snapshot => snapshot.docs.forEach(doc => probaUI(doc.data())))
                .catch(err => console.log(err));
        } else {
            console.log('please choose shot area first!');
        }
    }
});

start.addEventListener('click', () => {
    db.collection('scoreboard').doc('8INB3WvnFfHejNPCzMKh').set({
        player: 'userA',
        score: 0
    }).then();
    start.classList.add('hidden');
    userA.classList.remove('hidden');
    unsubidUser();
    scoreUI();
});

agree.addEventListener('click', () => {
    db.collection('scoreboard').doc('do7bG6qLf66nRjKecoYe').set({
        player: 'userB',
        score: 0
    }).then();
    agree.classList.add('hidden');
    userB.classList.remove('hidden');
    unsubidUser();
    scoreUI();
});

//download data and make a shot,  and then write the result to the database
hit.addEventListener('click', () => {
    // console.log(expectedShot, typeof(expectedShot));
    if(expectedShot){
        downloadData('easy1to' + expectedShot)
            .then(snapshot => checkHit(snapshot.docs))
            .catch(err => console.log(err));
        pitch = 0;
        hit.classList.add('hidden');
    } else {
        console.log('please choose shot area first!');
    }
});

//read the last shot result and hit back
hitback.addEventListener('click', () => {
    // console.log(expectedShot, typeof(expectedShot));
    if(expectedShot){
        db.collection('AreaPlayAt').orderBy('created_at').get()
            .then(snapshot => {
                return downloadData(snapshot.docs.reverse()[0].data().shotFrom + 'to' + expectedShot);
            })
            .then(snapshot => checkHit(snapshot.docs))
            .catch(err => console.log(err));
    } else {
        console.log('please choose shot area first!');
    }
});

// reset scoreboard
db.collection('scoreboard').doc('8INB3WvnFfHejNPCzMKh').set({}).then();
db.collection('scoreboard').doc('do7bG6qLf66nRjKecoYe').set({}).then();

idUser();

ball(round);

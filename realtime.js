// Player UI, person pressed 'start' button is playerA
const idUser = () => {
    unsubidUser = db.collection('scoreboard').onSnapshot(snapshot => {
        console.log('idUser actions');
        snapshot.docChanges().forEach(change => {
            if(change.type === 'modified'){
                start.classList.add('hidden');
                agree.classList.remove('hidden');
            }
        });
    });
};

// court UI and hit buttons UI
// issue: if 1st round is 'score' or 'out', hitBack eventlistener cannot read the latest data (null)
const ball = max => {
    let controller = - max - 1;
    unsubball = db.collection('AreaPlayAt').onSnapshot(snapshot => {
        console.log('ball actions');
        // console.log(controller, snapshot.size);
        let data = snapshot.docChanges()[0].doc.data().shotFrom;
        // if data includes 'super', e.g. change 'superhard1' to 'hard1Super'
        if(data.includes('super')){
            data = data.substr(5, 5) + 'Super';
        }
        let quality = checkQ(data);
        if(controller < snapshot.size - max){
            controller = snapshot.size;
        } else if (controller + 1 === snapshot.size){
            hit.classList.add('hidden');
            activeHitBack += pitch;
            pitch = 0;
            if(activeHitBack === 1){
                hitback.classList.remove('hidden');
                botImg.setAttribute('src', `img/bot${data[4]}.bmp`);
                dropPoint.innerText = `${data} is coming!`;
            } else {
                topImg.setAttribute('src', `img/top${data[4]}.bmp`);
                dropPoint.innerText = `You have played a ${quality}!`;
            }
            scoreReason.innerText = '';
        } else if (controller + 1 < snapshot.size){
            hitback.classList.toggle('hidden'); // ball is here
            if(hitback.classList.contains('hidden')){
                botImg.setAttribute('src', 'img/bot.bmp');
                topImg.setAttribute('src', `img/top${data[4]}.bmp`);
                dropPoint.innerText = `You have played a ${quality}!`;
            } else {
                topImg.setAttribute('src', 'img/top.bmp');
                botImg.setAttribute('src', `img/bot${data[4]}.bmp`);
                dropPoint.innerText = `${data} is coming!`;
            }
        }
    });
};

// score UI and restart hitting process
const scoreUI = () => {
    db.collection('scoreboard').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            console.log('scoreUI actions');
            unsubball();
            hit.classList.remove('hidden');
            hitback.classList.add('hidden');
            if(change.doc.data().score){
                db.collection('scoreboard').doc('8INB3WvnFfHejNPCzMKh').get().then(snapshot => {
                    scoreA.innerText = `A: ${snapshot.data().score}`;
                });
                db.collection('scoreboard').doc('do7bG6qLf66nRjKecoYe').get().then(snapshot => {
                    scoreB.innerText = `B: ${snapshot.data().score}`;
                });
                if(change.doc.id === '8INB3WvnFfHejNPCzMKh'){
                    scoreReason.innerText = `playerA scores with a ${change.doc.data().reason}`;
                } else {                    
                    scoreReason.innerText = `playerB scores with a ${change.doc.data().reason}`;
                }
            }
            dropPoint.innerText = '';
            ball(round);
            pitch = 1, activeHitBack = 0;
        });
    });
};
// probability UI
const probaUI = data => {
    const li = document.createElement('li');
    li.innerHTML = `
        probability: <span style="color: blue; font-style: normal;">${data.probability}</span>  
        result: <span style="color: crimson; font-style: normal;">${data.result}</span>
    `;
    probability.appendChild(li);
};

// upload the shot result into database
const uploadShot = async (data, quality) => {
    const now = new Date();
    const difficulty = checkD(quality);
    const shotFrom = {
        shotFrom: data.result.replace(quality, difficulty),
        created_at: firebase.firestore.Timestamp.fromDate(now)
    };
    
    const response = await db.collection('AreaPlayAt').add(shotFrom);
    return response;
};

const downloadData = async fileName => {
    const response = await db.collection(fileName).orderBy('probability').get();
    return response;
};

// upload the score result into database
const renewScoreDB = async (user, reason) => {
    const docID = user === 'userA' ? '8INB3WvnFfHejNPCzMKh' : 'do7bG6qLf66nRjKecoYe';
    let snapshot = await db.collection('scoreboard').doc(docID).get();
    let score = snapshot.data().score;
    score ++;
    let response = await db.collection('scoreboard').doc(docID).set({
        player: user,
        score: score,
        reason: reason
    });
    return response;
};

// check difficulty of ball you have played
const checkD = data => {
    if(data.includes('bad')){
        return data.replace('bad', 'easy');
    } else {
        return data.replace('good', 'hard');
    }
};

// check quality of ball is played out
const checkQ = data => {
    if(data.includes('easy')){
        return data.replace('easy', 'bad');
    } else {
        return data.replace('hard', 'good');
    }
};

const checkHit = data => {
    let min = 0, max = 0;
    const rand = Math.random();
    data.forEach(doc => {
        min = max;
        max += doc.data().probability;
        if(min <= rand && rand < max){
            if(doc.data().result.includes('superbad')){
                uploadShot(doc.data(), 'superbad').then();
            } else if (doc.data().result.includes('supergood')){                    
                uploadShot(doc.data(), 'supergood').then();
            } else if (doc.data().result.includes('bad')){
                uploadShot(doc.data(), 'bad').then();
            } else if (doc.data().result.includes('good')){
                uploadShot(doc.data(), 'good').then();
                // someone gets a score when 'score' or 'out' or 'netball' happens
            } else if (doc.data().result.includes('score')){
                if(!userA.classList.contains('hidden')){
                    renewScoreDB('userA', doc.data().result).then();
                } else {
                    renewScoreDB('userB', doc.data().result).then();
                }
            } else {
                if(!userA.classList.contains('hidden')){
                    renewScoreDB('userB', doc.data().result).then();
                } else {
                    renewScoreDB('userA', doc.data().result).then();
                }
            }
        }
        // reset the expected shot area value
        expectedShot = undefined;
    });
};

let getTestWordsByChapterInLocalStorage = function () {
    let testChaptetestChaptersrs = localStorage.getItem('test_chapters')
    if (testChaptetestChaptersrs == null) {
        location.href = './index.html'
    } else {
        let testChaptersArray = testChaptetestChaptersrs.split(',')
        let tccd = JSON.parse(localStorage.getItem('textbookContentChapterDeck'))
        let filterTccd = tccd.filter(function (item, index, array) {
            for (let chapterId of testChaptersArray) {
                if (chapterId == item.TextbookContentChapterId) {
                    return item
                }
            }
        })
        let result = []
        for (let i in filterTccd) {
            result.push(filterTccd[i].WordId)
        }

        return Array.from(new Set(result))
    }
}

let getTestWordsByChapterInLocalStorageHasSentence = async function () {
    let wordList = getTestWordsByChapterInLocalStorage()
    let db1 = null

    return new Promise((resolve, reject) => {
        document.addEventListener('deviceready', function () {

            if (cordova.platformId === "browser") {
                db1 = openDatabase('word', '1.0', 'wordDB', 50 * 1024 * 1024);
            } else {
                db1 = window.sqlitePlugin.openDatabase({
                    name: 'word',
                    location: 'default',
                });
            }


            let hasSenWordList = []
            db1.transaction(function (tx) {
                for (let word of wordList) {
                    tx.executeSql('SELECT ws.WordSenId FROM word as w join worddef as wd on w.WordId = wd.WordId AND w.WordId = ? join wordsen as ws on wd.WordDefId = ws.WordDefId',
                        [word], function (tx, rs) {
                            if (rs.rows.length != 0) {
                                hasSenWordList.push(word)
                            }
                        }, function (tx, error) {
                        });
                }
            }, function (error) {
                reject([])
            }, function () {
                resolve(hasSenWordList)
            });
        })

    })

}


let randomArray = function (arr) {
    arr.sort(function () {
        return (0.5 - Math.random());
    });
    return arr
}

let getWordInfo = async function (wordId) {

    let queryWordAndWordDef = (wid) => new Promise((resolve, reject) => {
        db.transaction(function (tx) {
            tx.executeSql('SELECT w.WordId,w.TheWord,w.AudioPath,wd.WordDefId,wd.ChiDefinition,wd.Speech FROM word as w,worddef as wd WHERE w.WordId = ? AND wd.WordId = ? Order By wd.Myorder', [wid, wid], function (tx, rs) {
                resolve(rs.rows)
            }, function (tx, error) {
                reject(error)
                swal.fire('資料庫錯誤: ' + error.message);
            });
        }, function (error) {
            console.log('Transaction ERROR: ' + error.message);
        }, function () {
            // console.log('Query database OK');

        });
    })

    let queryWordSen = (wdefid) => new Promise((resolve, reject) => {
        db.transaction(function (tx) {
            tx.executeSql('SELECT WordSenId,ChiSentence,EngSentence FROM wordsen WHERE WordDefId = ? ORDER BY Myorder ', [wdefid], function (tx, rs) {
                resolve(rs.rows)
            }, function (tx, error) {
                reject(error)
                swal.fire('資料庫錯誤: ' + error.message);
            });
        }, function (error) {
            console.log('Transaction ERROR: ' + error.message);
        }, function () {
            // console.log('Query database OK');

        });
    })

    let wordInfoArr = []


    let queryWordAndWordDefResult = await queryWordAndWordDef(wordId)
    for (let i = 0; i < queryWordAndWordDefResult.length; i++) {
        let tempJson = {}
        tempJson.WordId = queryWordAndWordDefResult.item(i).WordId
        tempJson.WordDefId = queryWordAndWordDefResult.item(i).WordDefId
        tempJson.TheWord = queryWordAndWordDefResult.item(i).TheWord
        tempJson.Speech = queryWordAndWordDefResult.item(i).Speech
        tempJson.ChiDefinition = queryWordAndWordDefResult.item(i).ChiDefinition
        tempJson.AudioPath = queryWordAndWordDefResult.item(i).AudioPath
        tempArrayForWordSen = []
        let queryWordSenResult = await queryWordSen(queryWordAndWordDefResult.item(i).WordDefId)
        for (let j = 0; j < queryWordSenResult.length; j++) {
            let tempJsonForWordSen = {}
            tempJsonForWordSen.WordSenId = queryWordSenResult.item(j).WordSenId
            tempJsonForWordSen.ChiSentence = queryWordSenResult.item(j).ChiSentence
            tempJsonForWordSen.EngSentence = queryWordSenResult.item(j).EngSentence
            tempArrayForWordSen.push(tempJsonForWordSen)
        }
        tempJson.wordSen = tempArrayForWordSen
        wordInfoArr.push(tempJson)
    }

    return wordInfoArr

}


let cancel_test = function () {

    $('body').append(`<div id="div_opacity" ><div class="div_opacity"></div>
        <div class="div_loading" id="div_loading"  style="    display: none;">
            <div class="card" id="logout_card" style="
    padding-top: 65px;
    padding-bottom: 65px;
    text-align: center;
    border-radius: 15px;
    color: #5F89C7;
    box-shadow: 0px 30px 30px #0000001A;
    ">

                <span style="font-size: x-large;" >
            取消測驗?</span>
            </div>
                    <div class="row" style="margin-top: 30px;">
                    <div class="col s1"></div>
                    <div class="col s4" style="text-align: center;padding:13px;background-color: #5F89C7;border-radius:4px;" onclick="javascript:back_to_index()">
                        <a style="color: white;">確認</a>
                    </div>
                    <div class="col s2"></div>
                    <div class="col s4" style="text-align: center;padding:13px; background-color:#9FC5FF; border-radius:4px;" onclick="javascript:remove_div_opacity()">
                        <a style="color: white;">返回</a>
                    </div>
                    <div class="col s1"></div>

                    </div>

        </div>
        </div>`)

    $('#div_loading').fadeIn('normal')
}

let back_to_index = function () {
    localStorage.removeItem('test_chapters')
    location.href = './index.html'
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
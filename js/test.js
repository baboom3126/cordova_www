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

let randomArray = function (arr) {
    arr.sort(function () {
        return (0.5 - Math.random());
    });
    return arr
}

let getWordInfo = function (wordId) {

    var wordInfo = JSON.parse(localStorage.getItem('word')).filter(function (item, index, array) {
        return item.WordId == wordId
    })

    let wordInfo_filter_by_wordDef = {}

    for (let i in wordInfo) {
        if (!wordInfo_filter_by_wordDef[wordInfo[i].WordDefId]) {
            wordInfo_filter_by_wordDef[wordInfo[i].WordDefId] = []
            wordInfo_filter_by_wordDef[wordInfo[i].WordDefId].push(wordInfo[i])
        } else {
            wordInfo_filter_by_wordDef[wordInfo[i].WordDefId].push(wordInfo[i])
        }
    }
    let wordInfoArr = []
    for (let i of Object.keys(wordInfo_filter_by_wordDef)) {
        let temp = {}
        temp.AudioPath = wordInfo_filter_by_wordDef[i][0].AudioPath
        temp.ChiDefinition = wordInfo_filter_by_wordDef[i][0].ChiDefinition
        temp.Speech = wordInfo_filter_by_wordDef[i][0].Speech
        temp.TheWord = wordInfo_filter_by_wordDef[i][0].TheWord
        temp.WordDefId = i
        temp.WordId = wordId
        let wordSen = []
        for (let j of wordInfo_filter_by_wordDef[i]) {
            if (j.WordSenId!=null) {
                let tempSenJSON = {}
                tempSenJSON.ChiSentence = j.ChiSentence
                tempSenJSON.EngSentence = j.EngSentence
                tempSenJSON.WordSenId = j.WordSenId
                wordSen.push(tempSenJSON)
            }
        }
        temp.wordSen = wordSen
        wordInfoArr.push(temp)
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
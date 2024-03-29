let testCount = 0;
let good = []
let normal = []
let bad = []
let db = null

$(document).ready(function () {

    swal.fire({
        title: '讀取資料中'
    });
    swal.showLoading();

})



getTestWordsByChapterFromSqlHasSentence().then(result=>{

    let testWords = randomArray(result)

    //過濾後如果完全沒有單字的話
    if(result.length===0){
        Swal.fire({
            title: '測驗範圍內的單字都沒有例句',
            showDenyButton: false,
            showCancelButton: false,
            confirmButtonText: `返回首頁`,
            denyButtonText: `取消`,
        }).then((result) => {
            location.href = './index.html'
        })
    }


    $('#btn_answer_good').click(async function(){
        let id = testWords[testCount - 1]
        let wordInfo = await getWordInfo(id)
        let word = wordInfo[0].TheWord
        good.push({id: id, word: word})

        if (testCount == testWords.length) {

            let test_result_mode3 = {}
            test_result_mode3.good = good
            test_result_mode3.normal = normal
            test_result_mode3.bad = bad
            localStorage.setItem("test_result_mode3", JSON.stringify(test_result_mode3))
            $('#div_answers').css('margin-top', '15%')
            $('#div_answers').html('<a href="./test_result_mode.html?mode=3" class="btn confirm_button waves-effect">結束測驗</a>')

            console.log('done')
        } else {
            currentWord = testWords[testCount]
            await nextCard(testCount)
        }

    })

    $('#btn_answer_normal').click(async function(){
        let id = testWords[testCount - 1]
        let wordInfo = await getWordInfo(id)
        let word = wordInfo[0].TheWord
        normal.push({id: id, word: word})

        if (testCount == testWords.length) {

            let test_result_mode3 = {}
            test_result_mode3.good = good
            test_result_mode3.normal = normal
            test_result_mode3.bad = bad
            localStorage.setItem("test_result_mode3", JSON.stringify(test_result_mode3))
            $('#div_answers').css('margin-top', '15%')
            $('#div_answers').html('<a href="./test_result_mode.html?mode=3" class="btn confirm_button waves-effect">結束測驗</a>')

            console.log('done')
        } else {
            currentWord = testWords[testCount]
            await nextCard(testCount)
        }

    })

    $('#btn_answer_bad').click(async function(){
        let id = testWords[testCount - 1]
        let wordInfo = await getWordInfo(id)
        let word = wordInfo[0].TheWord
        bad.push({id: id, word: word})

        if (testCount == testWords.length) {

            let test_result_mode3 = {}
            test_result_mode3.good = good
            test_result_mode3.normal = normal
            test_result_mode3.bad = bad
            localStorage.setItem("test_result_mode3", JSON.stringify(test_result_mode3))
            $('#div_answers').css('margin-top', '15%')
            $('#div_answers').html('<a href="./test_result_mode.html?mode=3" class="btn confirm_button waves-effect">結束測驗</a>')

            console.log('done')
        } else {
            currentWord = testWords[testCount]
            await nextCard(testCount)
        }

    })




    let nextCard = async function (index) {

        let cardHtml = await getCardHtmlForMode1ByWord(testWords[index])
        $('#word_card').html(cardHtml)
        testCount = testCount + 1
        $('#test_progressCounter').text(testCount + '/' + testWords.length)
        $('#test_progressBar').css('width', (testCount / testWords.length) * 100 + '%')
    }


    let getCardHtmlForMode1ByWord = async function (wordId) {
        let wordInfo = await getWordInfo(wordId)
        console.log(wordInfo)

        let word = wordInfo[0].TheWord

        let appendDetailHtml = ``

        let CaptialFirstLetterWord = word.charAt(0).toUpperCase() + word.slice(1);

        let regex = null
        try{
            regex = new RegExp('('+word+'|'+CaptialFirstLetterWord+')', "g");
        }catch(error){
            console.log(error)
        }
        for (let i of wordInfo) {
            appendDetailHtml += `<div class="back_card_word_block"><b><span style="color:grey;">解釋</span><p><span style="color: green;">${i.Speech === null ? '' : i.Speech} </span> ${i.ChiDefinition}</b> </p><b><span style="color:grey;">例句</span></b>`
            let counter = 1
            for (let j of i.wordSen) {
                appendDetailHtml += `<p style="color: #5F89C7;">${counter}. ${(j.EngSentence).replace(regex, '<span class="word_highlight">' + word + '</span>')}</p><p >${j.ChiSentence}</p>`
                counter = counter + 1
            }
            appendDetailHtml += `</div>`
        }


        // appendDetailHtml = appendDetailHtml.replace(regex,'<span class="word_highlight">'+word+'</span>')

        //

        let sentenceArray = []
        for (let i of wordInfo) {
            for (let j of i.wordSen) {
                if (j.EngSentence) {
                    sentenceArray.push(j.EngSentence.replace(regex, '<span class="word_highlight">' + word + '</span>'))
                }
            }

        }
        if(sentenceArray.length === 0){
            sentenceArray.push('<span class="word_highlight">'+word+'</span><br>此單字沒有例句')
        }

        let front_card_html = sentenceArray[getRandomInt(sentenceArray.length)]


        let cardHtml = `
            <div class="flip-container" onclick="this.classList.toggle('hover');">
            <div class="flipper">
                <div class="front align-middle">
                    <div class="test_card">
                        <div class="row" style="height: 5%;">
                        </div>
                        <div class="row" style="height: 15%;">
                            <div class="col s10">

                            </div>
                            <div class="col s2">
<!--                                <img src="./img/main/iconSTAR@3x.png" height="20" style="margin-top: 10px;">-->
                            </div>
                        </div>
                        <div class="row" style="height: 20%;"></div>

                        <div class="row" style="">
                            <div class="col s12" style="text-align: center;font-size: 18px;color: #5F89C7;">
                                ${front_card_html}
                            </div>

                        </div>
                    </div>

                </div>
                <div class="back ">
                    <div class="test_card">
                        <div class="row" style="height: 5%;">
                        </div>
                        <div class="row" style="height: 15%;border-bottom: 1px solid #E1F2FF;">
                            <div class="col s10">
                                <span class="test_card_back_title">${word}</span>
                            </div>
                            <div class="col s2">
<!--                                <img src="./img/main/iconSTAR@3x.png" height="20" style="margin-top: 10px;">-->
                            </div>
                        </div>
                        <div class="row" style="margin-top: 5px;">
                            <div class="col s12" style="font-size: 14px;color: #707070;padding-bottom: 5px;">
                                ${appendDetailHtml}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>

    
    
    `
        return cardHtml
    }


    document.addEventListener('deviceready', async function () {
        swal.close()
        if (cordova.platformId === "browser") {
            db = openDatabase('word', '1.0', 'wordDB', 50 * 1024 * 1024);

            await nextCard(0)
            testCount = 1
        } else {
            db = window.sqlitePlugin.openDatabase({
                name: 'word',
                location: 'default',
            });

            await nextCard(0)
            testCount = 1
        }
    })

}).catch(err=>{
    swal.fire(`資料庫錯誤 ${err}`)
})

// let testWords = randomArray(getTestWordsByChapterInLocalStorage())



// let answer_click = async function (status) {
//
//     let id = testWords[testCount - 1]
//     let wordInfo = await getWordInfo(id)
//     let word = wordInfo[0].TheWord
//
//     switch (status) {
//         case "good":
//             good.push({id: id, word: word})
//             break;
//         case "normal":
//             normal.push({id: id, word: word})
//             break;
//         case "bad":
//             bad.push({id: id, word: word})
//             break;
//     }
//
//     if (testCount == testWords.length) {
//
//         let test_result_mode3 = {}
//         test_result_mode3.good = good
//         test_result_mode3.normal = normal
//         test_result_mode3.bad = bad
//         localStorage.setItem("test_result_mode3", JSON.stringify(test_result_mode3))
//         $('#div_answers').css('margin-top', '15%')
//         $('#div_answers').html('<a href="./test_result_mode.html?mode=3" class="btn confirm_button waves-effect">結束測驗</a>')
//
//         console.log('done')
//     } else {
//         currentWord = testWords[testCount]
//         await nextCard(testCount)
//     }
//
// }


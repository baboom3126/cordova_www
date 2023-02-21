let deviceHeight = document.documentElement.clientHeight
// let testWords = randomArray(getTestWordsByChapterInLocalStorage())
// let testWords = ["competence",  "stockpile", "trigger","consumer", "phenomenon", "ration"]
let testCount = 0;
let correct = []
let wrong = []
let db = null;

$(document).ready(function () {

    swal.fire({
        title: '讀取資料中'
    });
    swal.showLoading();
})

getTestWordsByChapterFromSqlHasSentence().then(result => {


    let testWords = randomArray(result)

    if (result.length === 0) {
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


    $(document).ready(function () {
        document.addEventListener('deviceready', async function () {
            swal.close()
            $('#div_row1').css('height', deviceHeight / 10 * 1 + 'px')
            $('#div_row2').css('height', deviceHeight / 10 * 1 + 'px')
            $('#div_row3').css('height', deviceHeight / 10 * 5 + 'px')
            $('#div_row4').css('height', deviceHeight / 10 * 1 + 'px')
            $('#div_row4_1').css('height', deviceHeight / 10 * 1 + 'px')

            $('#div_row5').css('height', deviceHeight / 10 * 1 + 'px')


            $('#div_input').focusin(function () {
                $('#div_row1').hide()
                $('#div_row2').hide()
                $('#div_row5').hide()
                $('#test_card_for_mode45').css('height', '98%')
                $('#div_row3').css('height', deviceHeight / 10 * 5 - 20 + 'px')

            })

            $('#div_input').focusout(function () {
                setTimeout(function () {

                    $('.test_card_for_mode45').css('height', '90%')
                    $('#div_row3').css('height', deviceHeight / 10 * 5 + 'px')

                    $('#div_row1').show()
                    $('#div_row2').show()
                    $('#div_row5').show()
                }, 50)

            })

            $('#btn_start').click(async function () {
                $('#btn_start').remove()
                $('#div_start').remove()

                if (cordova.platformId === "browser") {
                    db = openDatabase('word', '1.0', 'wordDB', 50 * 1024 * 1024);

                    await init_test()

                } else {
                    db = window.sqlitePlugin.openDatabase({
                        name: 'word',
                        location: 'default',
                    });

                    await init_test()

                }
            })

            // $('#test_card_for_mode45').click(function () {
            //     audio_word.play()
            // })


            $('#confirm_answer_button').click(async function () {
                let answer = $('#input_test_mode4_answer').val().toLowerCase()
                if (answer === "") {

                    M.toast({html: '請輸入答案', displayLength: 1000})

                } else {

                    $('#confirm_answer_button').hide()
                    $('#i_dont_know_button').hide()

                    $('#btn_nextWord').show()

                    await show_wordDetail()
                    $('#span_correct_or_wrong').show()

                    let wordInfo = await getWordInfo(testWords[testCount])
                    if (answer == wordInfo[0].TheWord.toLowerCase()) {

                        let id = testWords[testCount]
                        let word = wordInfo[0].TheWord
                        correct.push({id: id, word: word})
                        $('#span_correct_or_wrong').css('color', '#5F89C7')
                        $('#span_correct_or_wrong').text('答對了')

                        // M.toast({html: '正確', displayLength: 1000, classes: 'green'})


                    } else {

                        let id = testWords[testCount]
                        let wordInfo = await getWordInfo(id)
                        let word = wordInfo[0].TheWord
                        wrong.push({id: id, word: word})
                        $('#span_correct_or_wrong').css('color', '#E25A53')
                        $('#span_correct_or_wrong').text('答錯了')

                        // M.toast({html: '錯誤 正確答案為' + testWords[testCount], displayLength: 1000, classes: 'red'})


                    }


                }

            })

            $('#i_dont_know_button').click(function () {
                $('#i_dont_know_button').hide()
                $('#input_test_mode4_answer').val(" ")
                $('#confirm_answer_button').click()
            })


            $('#btn_nextWord').click(async function () {


                if (testCount == testWords.length - 1) {
                    $('#btn_nextWord').text('測驗結束')
                    $('#div_row4_1').html(`<a href="./test_result_mode.html?mode=5" class="btn confirm_button waves-effect">結束測驗</a>`)

                    console.log('done')
                    let test_result = {}
                    test_result.correct = correct
                    test_result.wrong = wrong

                    localStorage.setItem('test_result_mode5', JSON.stringify(test_result))


                } else {
                    $('#input_test_mode4_answer').val('')

                    $('#span_correct_or_wrong').hide()
                    $('#btn_nextWord').hide()
                    $('#confirm_answer_button').show()
                    $('#i_dont_know_button').show()
                    testCount = testCount + 1
                    $('#test_progressCounter').text((testCount + 1) + '/' + testWords.length)
                    $('#test_progressBar').css('width', ((testCount + 1) / testWords.length) * 100 + '%')
                    await next_word()
                }


            })

        })
    })

    let init_test = async function () {
        $('#test_progressCounter').text((testCount + 1) + '/' + testWords.length)
        $('#test_progressBar').css('width', ((testCount + 1) / testWords.length) * 100 + '%')

        let wordInfo = await getWordInfo(testWords[0])
        let word = wordInfo[0].TheWord


        let sentenceArray = []
        let sentenceZeroFlag = false

        for (let i of wordInfo) {
            if (i.wordSen.length != 0) {
                sentenceZeroFlag = true

                let CaptialFirstLetterWord = word.charAt(0).toUpperCase() + word.slice(1);

                let regex = null
                try{
                    regex = new RegExp('(' + word + '|' + CaptialFirstLetterWord + ')', "g");
                }catch(error){
                    console.log(error)
                }


                for (let j of i.wordSen) {
                    sentenceArray.push({
                        chiSen: j.ChiSentence,
                        engSen: j.EngSentence.replace(regex, '<span class="word_hollow">' + word[0] + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>')
                    })
                }
            }
        }

        if (sentenceZeroFlag === false) {
            sentenceArray.push({engSen: '<span class="word_highlight">' + word + '</span>', chiSen: '此單字沒有例句'})
            $('#input_test_mode4_answer').val(word)

        }

        let randomIndex = getRandomInt(sentenceArray.length)
        let front_card_html = `<div class="div_mode5_eng">${sentenceArray[randomIndex].engSen}</div><br><div class="div_mode5_chi">${sentenceArray[randomIndex].chiSen}</div>`


        $('#div_sentence').html(front_card_html)
        $('#div_sentence').find('.word_highlight').html(word[0] + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp')
        $('#div_sentence').find('.word_highlight').addClass('word_hollow')

        if (wordInfo[0].AudioPath != "") {
            $('#audio_source').attr('src', wordInfo[0].AudioPath)

        } else {


        }


    }


    let next_word = async function () {
        let wordInfo = await getWordInfo(testWords[testCount])
        let word = wordInfo[0].TheWord


        $('#test_card_for_mode45_back').html('')
        $('#test_card_for_mode45').show()

        let sentenceArray = []

        let sentenceZeroFlag = false

        for (let i of wordInfo) {
            if (i.wordSen.length != 0) {
                sentenceZeroFlag = true

                let CaptialFirstLetterWord = word.charAt(0).toUpperCase() + word.slice(1);

                let regex = null;

                try{
                    regex = new RegExp('(' + word + '|' + CaptialFirstLetterWord + ')', "g");
                }catch(error){
                    console.log(error)
                }

                for (let j of i.wordSen) {
                    sentenceArray.push({
                        chiSen: j.ChiSentence,
                        engSen: j.EngSentence.replace(regex, '<span class="word_hollow">' + word[0] + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>')
                    })
                }
            }
        }

        if (sentenceZeroFlag === false) {
            sentenceArray.push({engSen: '<span class="word_highlight">' + word + '</span>', chiSen: '此單字沒有例句'})
            $('#input_test_mode4_answer').val(word)

        }

        let randomIndex = getRandomInt(sentenceArray.length)
        let front_card_html = `<div class="div_mode5_eng">${sentenceArray[randomIndex].engSen}</div><br><div class="div_mode5_chi">${sentenceArray[randomIndex].chiSen}</div>`

        $('#div_sentence').html(front_card_html)
        $('#div_sentence').find('.word_highlight').html(word[0] + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp')
        $('#div_sentence').find('.word_highlight').addClass('word_hollow')

        $('#test_card_for_mode45_back').hide()


        if (wordInfo[0].AudioPath != "") {
            $('#audio_source').attr('src', wordInfo[0].AudioPath)

        } else {


        }

    }

    let show_wordDetail = async function () {

        let wordInfo = await getWordInfo(testWords[testCount])
        ///
        let word = wordInfo[0].TheWord
        let appendDetailHtml = ``

        let CaptialFirstLetterWord = word.charAt(0).toUpperCase() + word.slice(1);


        let regex = null;
        try{
            regex = new RegExp('(' + word + '|' + CaptialFirstLetterWord + ')', "g");

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

        // appendDetailHtml = appendDetailHtml.replace(regex, '<span class="word_highlight">' + word + '</span>')
////
        $('#test_card_for_mode45').hide()

        $('#test_card_for_mode45_back').html(`
    
    <div class="" style="height:100%;">
                        <div class="row" style="height: 5%;">
                        </div>
                        <div class="row" style="height: 15%;border-bottom: 1px solid #E1F2FF;">
                            <div class="col s10">
                                <span class="test_card_back_title">${wordInfo[0].TheWord}</span>
                            </div>
                            <div class="col s2" onclick="javascript:play_audio()">
                                <i class="material-icons dp48" style="margin-top: 10px;color:#5F89C7;">volume_up</i>
                            </div>
                        </div>
                        <div class="row" style="margin-top: 5px;">
                            <div class="col s12" style="font-size: 14px;color: #707070;padding-bottom: 5px;">
                                
                       ${appendDetailHtml}
                        
                            </div>

                        </div>
                    </div>
    
    `)

        $('#test_card_for_mode45_back').show()

    }


})


let play_audio = function () {
    if ($('#audio_source').attr('src') === "null") {
        let word = $('.test_card_back_title').text()
        var msg = new SpeechSynthesisUtterance(word);
        window.speechSynthesis.speak(msg);
    } else {
        audio_word.load()
        audio_word.play()
    }
}
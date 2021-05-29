
swal.showLoading()

let db = null
let isFront = true

$(document).ready(function () {
    $('ul.tabs').tabs({
        swipeable: true,
        responsiveThreshold: 1920
    });

    $('#front_div-deck-card_align-middle').click(function(){
        console.log('front clicked')
        isFront = false
    })

    document.addEventListener('deviceready', function () {

        if (cordova.platformId === "browser") {
            db = openDatabase('word', '1.0', 'wordDB', 50 * 1024 * 1024);
        } else {
            db = window.sqlitePlugin.openDatabase({
                name: 'word',
                location: 'default',
            });
        }

    })

    upadteResult()
    show_word_socre_list()


});


var show_word = async function (wordId) {

    if(isFront===false){
        $('#flip-container').click()
        isFront = true
    }

    $('#div_opacity').css('display','')

    $('body').css('overflow-y', 'hidden')

    let queryWord = (wid) => new Promise((resolve,reject)=>{
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM word WHERE WordId = ?', [wid], function (tx, rs) {
                resolve(rs.rows.item(0))
            }, function (tx, error) {
                reject(error)
                swal.fire('資料庫錯誤: ' + error.message);
            });
        }, function (error) {
            console.log('Transaction ERROR: ' + error.message);
        }, function () {
            console.log('Query database OK');

        });
    })
    let queryWordDef = (wid) => new Promise((resolve,reject)=>{
        db.transaction(function (tx) {
            tx.executeSql(`SELECT WordDefId,ChiDefinition,Speech FROM worddef WHERE WordId = ? ORDER BY Myorder`, [wid]
                , function (tx, rs) {
                    resolve(rs.rows)
                }, function (tx, error) {
                    reject(error)
                    swal.fire('資料庫錯誤: ' + error.message);
                });
        }, function (error) {
            console.log('Transaction ERROR: ' + error.message);
        }, function () {
            console.log('Query database OK');

        });
    })

    let queryWordSen = (wdefid) => new Promise((resolve, reject) => {
        db.transaction(function (tx) {
            tx.executeSql('SELECT ChiSentence,EngSentence FROM wordsen WHERE WordDefId = ? ORDER BY Myorder ', [wdefid], function (tx, rs) {
                resolve(rs.rows)
            }, function (tx, error) {
                reject(error)
                swal.fire('資料庫錯誤: ' + error.message);
            });
        }, function (error) {
            console.log('Transaction ERROR: ' + error.message);
        }, function () {
            console.log('Query database OK');

        });
    })

    let queryWordResult = await queryWord(wordId)
    let word_theWord = queryWordResult.TheWord
    let word_audioPath = queryWordResult.AudioPath
    let word_remarks = queryWordResult.Remarks

    if (word_audioPath != "null") {
        $('#audio_source').attr('src', word_audioPath)
        audio_word.load()
        audio_word.play()
    }

    let appendHtmlForWordInfo = `<div class="back_card_word_title">${word_theWord}</div>`
    let appendHtmlForWordBlocks = ``

    let queryWordDefResult = await queryWordDef(wordId)
    let thisWordSpeechSet = new Set()
    for(let i =0;i<queryWordDefResult.length;i++){
        thisWordSpeechSet.add(queryWordDefResult.item(i).Speech)
        let queryWordSenResult = await queryWordSen(queryWordDefResult.item(i).WordDefId)
        appendHtmlForWordBlocks += `<div class="back_card_word_block">`
        appendHtmlForWordBlocks += `<div style="color: #707070;font-weight: 600;">解釋</div>
                                    <div>
                                        <span style="color:#E25A53;">[${queryWordDefResult.item(i).Speech === null ? '' : queryWordDefResult.item(i).Speech}] </span>
                                        ${queryWordDefResult.item(i).ChiDefinition}
                                    </div>
                                    <div style="color: #707070;font-weight: 600;">例句</div>`
        let counter = 1
        for(let j = 0;j<queryWordSenResult.length;j++){
            if (queryWordSenResult.item(j).EngSentence || queryWordSenResult.item(j).ChiSentence) {
                appendHtmlForWordBlocks += `<div class="back_card_word_sen_eng">${counter}. ${queryWordSenResult.item(j).EngSentence}</div>
                                        <div class="back_card_word_def_chi">${queryWordSenResult.item(j).ChiSentence}</div><br>
                                        `
                counter = counter + 1
            }
        }
        appendHtmlForWordBlocks += `</div>`

    }
    var regex = new RegExp(word_theWord, "g");
    appendHtmlForWordBlocks = appendHtmlForWordBlocks.replace(regex, '<span class="word_highlight">' + word_theWord + '</span>')

    let device_height = document.documentElement.clientHeight
    // $('#div_previous_word').attr('onclick',`javascript:show_previous_word('${wordId}')`)
    // $('#div_next_word').attr('onclick',`javascript:show_next_word('${wordId}')`)
    $('#flip-container').css('top',`${device_height * 0.15}px`)
    $('#front_div-deck-card_align-middle').css('height',`${device_height * 0.7}px`)
    $('#div-deck-card_back').css('height',`${device_height * 0.7}px`)
    $('#span_front_theWord').text(word_theWord)
    $('#div_front_speech').text(Array.from(thisWordSpeechSet).join(', '))
    $('#div_back_card_info_inner').html(appendHtmlForWordInfo+appendHtmlForWordBlocks)

    $('#div_back_word_remarks').text(word_remarks)


}


var close_word = function (that) {
    $('#div_opacity').css('display','none')
    $('body').css('overflow-y', '')

}


let show_word_socre_list = function () {

    let urlParam = location.href.split('?')[1]
    let mode = urlParam.split('mode=')[1]


    if (mode === '1') {

        let test_result_mode1 = localStorage.getItem('test_result_mode1')
        if (test_result_mode1 == null) {
            swal.fire('沒有成績')
        }
        let JSON_test_result_data = JSON.parse(test_result_mode1)
        show_word_socre_list_for_123_mode(JSON_test_result_data)

    } else if (mode === '2') {
        let test_result_mode2 = localStorage.getItem('test_result_mode2')
        if (test_result_mode2 == null) {
            swal.fire('沒有成績')
        }
        let JSON_test_result_data = JSON.parse(test_result_mode2)
        show_word_socre_list_for_123_mode(JSON_test_result_data)


    } else if (mode === '3') {
        let test_result_mode3 = localStorage.getItem('test_result_mode3')
        if (test_result_mode3 == null) {
            swal.fire('沒有成績')
        }
        let JSON_test_result_data = JSON.parse(test_result_mode3)
        show_word_socre_list_for_123_mode(JSON_test_result_data)

    } else if (mode === '4') {
        let test_result_mode4 = localStorage.getItem('test_result_mode4')
        if (test_result_mode4 == null) {
            swal.fire('沒有成績')
        }
        let JSON_test_result_data = JSON.parse(test_result_mode4)
        show_word_socre_list_for_45_mode(JSON_test_result_data)
    } else if (mode === '5') {
        let test_result_mode5 = localStorage.getItem('test_result_mode5')
        if (test_result_mode5 == null) {
            swal.fire('沒有成績')
        }
        let JSON_test_result_data = JSON.parse(test_result_mode5)
        show_word_socre_list_for_45_mode(JSON_test_result_data)
    }


}

let show_word_socre_list_for_123_mode = function (data) {


    Chart.defaults.plugins.legend.position = "right"

    let appendHTMLforGood = ``
    let appendHTMLforNormal = ``
    let appendHTMLforBad = ``

    let goodCount = parseInt(data.good.length)
    let normalCount = parseInt(data.normal.length)
    let badCount = parseInt(data.bad.length)

    let scoreNumerator = goodCount
    let socreDenominator = parseInt(data.good.length) + normalCount + badCount

    ///// pie chart
    const pieData = {
        labels: [
            '我認得的',
            '我不確定的',
            '我不記得的'
        ],
        datasets: [{
            label: 'My First Dataset',
            data: [goodCount, normalCount, badCount],
            backgroundColor: [
                '#A5E6C3',
                '#FFF29E',
                '#FFA3A3'
            ],
            hoverOffset: 4
        }]
    };
    const config = {
        type: 'pie',
        data: pieData,
        options: {
            responsive: true,
            legend: {
                position: "right",
                align: "middle"
            }
        }
    };
    var myChart = new Chart(
        document.getElementById('myChart'),
        config
    );


    ///


    $('#div_score').text('得分：' + scoreNumerator + '/' + socreDenominator)

    for (let i of data.good) {
        appendHTMLforGood += `<div class="row div_word_row" onclick="javascript:show_word('${i.id}')">${i.word}</div>`
    }
    for (let i of data.normal) {
        appendHTMLforNormal += `<div class="row div_word_row" onclick="javascript:show_word('${i.id}')">${i.word}</div>`

    }
    for (let i of data.bad) {
        appendHTMLforBad += `<div class="row div_word_row" onclick="javascript:show_word('${i.id}')">${i.word}</div>`

    }
    $('#div_tab_for_good').html(appendHTMLforGood)
    $('#div_tab_for_normal').html(appendHTMLforNormal)
    $('#div_tab_for_bad').html(appendHTMLforBad)
}


let show_word_socre_list_for_45_mode = function (data) {

    Chart.defaults.plugins.legend.position = "right"


    $('#li_3').css('display', 'none')
    $('#a_in_li_1').text('正確')
    $('#a_in_li_2').text('錯誤')


    let appendHtmlForCorrect = ''
    let appendHtmlForWrong = ''

    let correctCount = data.correct.length
    let wrongCount = data.wrong.length
    let socreDenominator = parseInt(correctCount) + parseInt(wrongCount)

    ///// pie chart
    const pieData = {
        labels: [
            '正確',
            '錯誤'
        ],
        datasets: [{
            label: 'My First Dataset',
            data: [correctCount, wrongCount],
            backgroundColor: [
                '#7FA8E6',
                '#e1f2ff'
            ],
            hoverOffset: 4
        }]
    };
    const config = {
        type: 'doughnut',
        data: pieData,
        options: {
            responsive: true,
            legend: {
                position: "right",
                align: "middle"
            }
        }
    };
    var myChart = new Chart(
        document.getElementById('myChart'),
        config
    );


    ///
    $('#div_score').text('' + correctCount + '/' + socreDenominator)
    $('#div_score').css('color', '#707070')


    for (let i of data.correct) {
        appendHtmlForCorrect += `<div class="row div_word_row" onclick="javascript:show_word('${i.id}')">${i.word}</div>`

    }

    for (let i of data.wrong) {
        appendHtmlForWrong += `<div class="row div_word_row" onclick="javascript:show_word('${i.id}')">${i.word}</div>`

    }
    $('#div_tab_for_good').html(appendHtmlForCorrect)
    $('#div_tab_for_normal').html(appendHtmlForWrong)

}


let upadteResult = function () {
    let urlParam = location.href.split('?')[1]
    let mode = urlParam.split('mode=')[1]
    console.log('mode ' + mode)

    let testResult = localStorage.getItem('test_result_mode' + mode)
    let student = localStorage.getItem('student')
    let test_chapters = localStorage.getItem('test_chapters')
    let test_chaptersArray = test_chapters.split(',')
    let postData = {}
    postData.mode = mode
    postData.testResult = JSON.parse(testResult)
    postData.studentId = JSON.parse(student).studentId
    postData.testChaper = test_chaptersArray
    try {
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": baseUrl + "app/updateTestResult",
            "method": "POST",
            "headers": {
                "content-type": "application/json",
                "cache-control": "no-cache",
            },
            data: JSON.stringify(postData)
        }

        $.ajax(settings).done(function (response) {
            $('#div_update_again').css('display','none')

            if(response.data==="ok"){
                Swal.fire({
                    title: '<strong>成功</strong>',
                    icon:'success',
                    html:'測驗結果已上傳'
                })
            }else{
                Swal.fire({
                    title: '<strong>失敗</strong>',
                    icon:'error',
                    html:'測驗結果上傳失敗'
                })
                $('#div_update_again').css('display','')

            }

        }).fail(function (response,status) {
            console.log(response)

            Swal.fire({
                title: '<strong>失敗</strong>',
                icon:'error',
                html:'測驗結果上傳失敗<br><small>無法記錄此次測驗</small>'
            })
            $('#div_update_again').css('display','')
        })
    } catch (err) {
        Swal.fire({
            title: '<strong>失敗</strong>',
            icon:'error',
            html:'沒有網路連線'
        })
        $('#div_update_again').css('display','')
    }
}
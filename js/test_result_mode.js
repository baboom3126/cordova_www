
swal.showLoading()


$(document).ready(function () {
    $('ul.tabs').tabs({
        swipeable: true,
        responsiveThreshold: 1920
    });
    upadteResult()
    show_word_socre_list()

});


var show_word = function (wordId) {
    $('body').css('overflow-y', 'hidden')
    var wordInfo = JSON.parse(localStorage.getItem('word')).filter(function (item, index, array) {
        return item.WordId == wordId
    })

    var word_theWord = wordInfo[0].TheWord
    var word_audioPath = wordInfo[0].AudioPath
    var word_remarks = wordInfo[0].Remarks

    let wordInfo_filter_by_wordDef = {}

    for (let i in wordInfo) {
        if (!wordInfo_filter_by_wordDef[wordInfo[i].WordDefId]) {
            wordInfo_filter_by_wordDef[wordInfo[i].WordDefId] = []
            wordInfo_filter_by_wordDef[wordInfo[i].WordDefId].push(wordInfo[i])
        } else {
            wordInfo_filter_by_wordDef[wordInfo[i].WordDefId].push(wordInfo[i])
        }
    }

    if (word_audioPath != "null") {
        $('#audio_source').attr('src', word_audioPath)
        audio_word.load()
        audio_word.play()
    }
    var appendHtmlForWordInfo = `<div class="back_card_word_title">${word_theWord}</div>`

    ///
    let appendHtmlForWordBlocks = ``
    for (let i of Object.keys(wordInfo_filter_by_wordDef)) {
        appendHtmlForWordBlocks += `<div class="back_card_word_block">`
        appendHtmlForWordBlocks += `<div>解釋</div><div><span>${wordInfo_filter_by_wordDef[i][0].Speech === null ? '' : wordInfo_filter_by_wordDef[i][0].Speech} </span>${wordInfo_filter_by_wordDef[i][0].ChiDefinition}</div><br><div>例句</div>`
        let counter = 1
        for (let j of wordInfo_filter_by_wordDef[i]) {
            ///for sentences
            if (j.EngSentence || j.ChiSentence) {
                appendHtmlForWordBlocks += `<div class="back_card_word_sen_eng">${counter}. ${j.EngSentence}</div>
                                        <div class="back_card_word_def_chi">${j.ChiSentence}</div><br>
                                        `
                counter = counter + 1
            }
        }
        appendHtmlForWordBlocks += `</div>`
    }

    appendHtmlForWordBlocks = appendHtmlForWordBlocks.replaceAll(word_theWord, '<span class="word_highlight">' + word_theWord + '</span>')


    let device_height = document.documentElement.clientHeight

    $('body').append(`<div id="div_opacity">
                            <div class="div_opacity"  onclick="javascript:close_word(this)"></div>

                            <div class="flip-container" onclick="this.classList.toggle('hover');" style="top:${device_height * 0.15}px">
                                    <div class="flipper">
                                        <div class="front div-deck-card align-middle" style="height:${device_height * 0.7}px;">
                                            <div style="top:42%;position:relative;text-align: center;color: #5F89C7;font-size: 26px;">
                                                ${word_theWord}<br><div style="font-size: 14px;">${wordInfo[0].Speech === null ? '' : wordInfo[0].Speech}</div>
                                            </div>

                                        </div>
                                        <div class="back div-deck-card" style="height:${device_height * 0.7}px;">
                                            <div class="row">
                                                <div class="back_card_info">
                                                
                                                ${appendHtmlForWordInfo}
                                                ${appendHtmlForWordBlocks}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                      </div>
                            
    `)


}


var close_word = function (that) {
    console.log($(that).parent().remove())
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

    let postData = {}
    postData.mode = mode
    postData.testResult = JSON.parse(testResult)
    postData.studentId = JSON.parse(student).studentId
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
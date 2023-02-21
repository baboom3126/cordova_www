let urlParams = {}
for(let value of location.href.split('?')[1].split('&')){
    let splitedValue = value.split('=')
    urlParams[splitedValue[0]] = splitedValue[1]
}
let db = null

let isFront = true
swal.showLoading()



$(document).ready(function() {
    $('ul.tabs').tabs({
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



    let postData = {}
    postData.testResultId = urlParams.testResultId
    let settings = {
        "async": true,
        "crossDomain": true,
        "url": baseUrl + "app/getTestResultDetail",
        "method": "POST",
        "headers": {
            "content-type": "application/json",
            "cache-control": "no-cache",
        }, data: JSON.stringify(postData)
    }
    $.ajax(settings).done(function (response, status) {
        console.log(response)


        if(urlParams.testMode ==='1' || urlParams.testMode ==='2' || urlParams.testMode ==='3' ){


            show_word_socre_list_for_123_mode(response.data)



        }else if(urlParams.testMode ==='4' || urlParams.testMode ==='5' ){

            show_word_socre_list_for_45_mode(response.data)


        }
        swal.close()
    })




})


let page_go_back = function (){
    window.history.back();
}


let show_word_socre_list_for_123_mode = function (data){
    let resultJSON = {'good':[],'normal':[],'bad':[]}
    for(let testWord of data){
        if(testWord.Score==='good'){
            resultJSON['good'].push(testWord)
        }else if(testWord.Score==='normal'){
            resultJSON['normal'].push(testWord)
        }else if(testWord.Score==='bad'){
            resultJSON['bad'].push(testWord)
        }
    }

    Chart.defaults.plugins.legend.position = "right"

    let appendHTMLforGood = ``
    let appendHTMLforNormal = ``
    let appendHTMLforBad = ``

    let goodCount = parseInt(resultJSON.good.length)
    let normalCount = parseInt(resultJSON.normal.length)
    let badCount = parseInt(resultJSON.bad.length)

    let scoreNumerator = goodCount
    let socreDenominator = parseInt(resultJSON.good.length) + normalCount + badCount

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

    for (let i of resultJSON.good) {
        appendHTMLforGood += `<div class="row div_word_row" onclick="javascript:show_word('${i.WordId}')">${i.TheWord}</div>`
    }
    for (let i of resultJSON.normal) {
        appendHTMLforNormal += `<div class="row div_word_row" onclick="javascript:show_word('${i.WordId}')">${i.TheWord}</div>`

    }
    for (let i of resultJSON.bad) {
        appendHTMLforBad += `<div class="row div_word_row" onclick="javascript:show_word('${i.WordId}')">${i.TheWord}</div>`

    }
    $('#div_tab_for_good').html(appendHTMLforGood)
    $('#div_tab_for_normal').html(appendHTMLforNormal)
    $('#div_tab_for_bad').html(appendHTMLforBad)


}

let show_word_socre_list_for_45_mode = function (data){
    let resultJSON = {'correct':[],'wrong':[]}
    for(let testWord of data){
        if(testWord.Score==='correct'){
            resultJSON['correct'].push(testWord)
        }else if(testWord.Score==='wrong'){
            resultJSON['wrong'].push(testWord)
        }
    }


    Chart.defaults.plugins.legend.position = "right"


    $('#li_3').css('display', 'none')
    $('#a_in_li_1').text('正確')
    $('#a_in_li_2').text('錯誤')


    let appendHtmlForCorrect = ''
    let appendHtmlForWrong = ''

    let correctCount = resultJSON.correct.length
    let wrongCount = resultJSON.wrong.length
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


    for (let i of resultJSON.correct) {
        appendHtmlForCorrect += `<div class="row div_word_row" onclick="javascript:show_word('${i.WordId}')">${i.TheWord}</div>`

    }

    for (let i of resultJSON.wrong) {
        appendHtmlForWrong += `<div class="row div_word_row" onclick="javascript:show_word('${i.WordId}')">${i.TheWord}</div>`

    }
    $('#div_tab_for_good').html(appendHtmlForCorrect)
    $('#div_tab_for_normal').html(appendHtmlForWrong)
}



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
    }else if (word_audioPath === "null") {
        var msg = new SpeechSynthesisUtterance(decodeURIComponent(word_theWord));
        window.speechSynthesis.speak(msg);
    }

    let appendHtmlForWordInfo = `<div class="back_card_word_title">${word_theWord}</div>`
    let appendHtmlForWordBlocks = ``

    let queryWordDefResult = await queryWordDef(wordId)
    let thisWordSpeechSet = new Set()

    let CaptialFirstLetterWord = word_theWord.charAt(0).toUpperCase() + word_theWord.slice(1);

    let regex = null
    try{
        regex = new RegExp('('+word_theWord+'|'+CaptialFirstLetterWord+')', "g");
    }catch(error){
        console.log(error)
    }
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
                appendHtmlForWordBlocks += `<div class="back_card_word_sen_eng">${counter}. ${queryWordSenResult.item(j).EngSentence.replace(regex, '<span class="word_highlight">' + word_theWord + '</span>')}</div>
                                        <div class="back_card_word_def_chi">${queryWordSenResult.item(j).ChiSentence}</div><br>
                                        `
                counter = counter + 1
            }
        }
        appendHtmlForWordBlocks += `</div>`

    }
    // appendHtmlForWordBlocks = appendHtmlForWordBlocks.replace(regex, '<span class="word_highlight">' + word_theWord + '</span>')

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

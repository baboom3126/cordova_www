var urlKeyValue = location.href.split('?')[1]
var splitUrlKeyValue = urlKeyValue.split('&')
var thisChapter = {}
for (var i in splitUrlKeyValue) {
    var tempURL = splitUrlKeyValue[i].split('=')
    thisChapter[tempURL[0]] = tempURL[1]
}
var db = null
var filterDeck;
var wordListArray = []

let isFront = true

$(document).ready(function () {

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

        // db.transaction(function (tx) {
        //     tx.executeSql('SELECT * FROM word', [], function (tx, rs) {
        //     }, function (tx, error) {
        //         swal.fire('SELECT error: ' + error.message);
        //     });
        // });


        $('#div_chapterName').html('' + decodeURIComponent(thisChapter.chapterName))
        var textbookContentChapterDeck = JSON.parse(localStorage.getItem('textbookContentChapterDeck'))
        if (textbookContentChapterDeck == null) {

        } else {
            filterDeck = textbookContentChapterDeck.filter(function (item, index, array) {
                return item.TextbookContentChapterId == thisChapter.chapterId
            })
            showWordList(filterDeck)
        }

        for (let i in filterDeck) {
            wordListArray.push(filterDeck[i].WordId)
        }
    })
})

var showWordList = function (data) {

    db.transaction(function (tx) {

        for (let i of data) {
            tx.executeSql('SELECT TheWord FROM word WHERE WordId = ?', [i.WordId], function (tx, rs) {
                console.log(rs)
                let appendHtml = `    <div class="row div_word_row" onclick="javascript:show_word('${i.WordId}')">
                            <div class="col s10">
                                <div class="">
                                ${rs.rows.item(0).TheWord}
                                </div>

                            </div>
                            <div class="col s2">
                                <div class="div_word_element_right">
<!--                                    <img src="./img/main/iconSTAR@3x.png" height="16">-->
<!--                                    <img src="./img/main/iconSTAR_selected@3x.png" height="16">-->

                                </div>
                            </div>
                        </div>`
                $('#div_word_list').append(appendHtml)


            }, function (tx, error) {
                swal.fire('資料庫錯誤:' + error.message);
            });
        }

    }, function (error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function () {
        console.log('Populated database OK');

    });

    // var wordIdAndNamepair = {}
    // var wordJSON = JSON.parse(localStorage.getItem('word'))
    // for (let i of data) {
    //     wordJSON.find(element => {
    //         if (element.WordId == i.WordId) {
    //             wordIdAndNamepair[i.WordId] = element.TheWord
    //         }
    //     })
    // }
    // console.log(wordIdAndNamepair)
    // var appendHtml = ``

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
        });
    })

    let queryWordResult = await queryWord(wordId)
    console.log(queryWordResult)
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
        console.log(queryWordDefResult.item(i).Speech)
        let queryWordSenResult = await queryWordSen(queryWordDefResult.item(i).WordDefId)
        console.log(queryWordDefResult.item(i).WordDefId)
        appendHtmlForWordBlocks += `<div class="back_card_word_block">`
        appendHtmlForWordBlocks += `<div style="color: #707070;font-weight: 600;">解釋</div>
                                    <div>
                                        <span style="color:#E25A53;">[${queryWordDefResult.item(i).Speech === null ? '' : queryWordDefResult.item(i).Speech}] </span>
                                        ${queryWordDefResult.item(i).ChiDefinition}
                                    </div>
                                    <div style="color: #707070;font-weight: 600;">例句</div>`
        let counter = 1
        for(let j = 0;j<queryWordSenResult.length;j++){
            console.log(queryWordSenResult)
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
    $('#div_previous_word').attr('onclick',`javascript:show_previous_word('${wordId}')`)
    $('#div_next_word').attr('onclick',`javascript:show_next_word('${wordId}')`)
    $('#flip-container').css('top',`${device_height * 0.15}px`)
    $('#front_div-deck-card_align-middle').css('height',`${device_height * 0.7}px`)
    $('#span_front_theWord').text(word_theWord)
    $('#div_front_speech').text(Array.from(thisWordSpeechSet).join(', '))
    $('#div_back_card_info_inner').html(appendHtmlForWordInfo+appendHtmlForWordBlocks)

    $('#div_back_word_remarks').text(word_remarks)
    // $('body').append(`<div id="div_opacity">
    //                         <div class="div_opacity"  onclick="javascript:close_word(this)"></div>
    //                         <div class="div_previous_word waves-effect" onclick="javascript:show_previous_word('${wordId}')"><img src="./img/btn/buttonBACK@3x.png" height="41" width="41"></div>
    //                         <div class="div_next_word waves-effect" onclick="javscript:show_next_word('${wordId}')"><img src="./img/btn/buttonNEXT@3x.png" height="41" width="41"></div>
    //
    //                         <div class="flip-container" onclick="this.classList.toggle('hover');" style="top:${device_height * 0.15}px">
    //                                 <div class="flipper">
    //                                     <div class="front div-deck-card align-middle" style="height:${device_height * 0.7}px;">
    //                                         <div style="top:42%;position:relative;text-align: center;color: #7193C4;font-size: 26px;font-weight: 600 ;">
    //                                             ${word_theWord}<br>
    //                                             <div style="font-size: 14px;font-weight: normal;color: #E25A53;">123</div>
    //                                         </div>
    //
    //                                     </div>
    //                                     <div class="back div-deck-card" style="height:${device_height * 0.7}px;">
    //                                         <div class="row">
    //                                             <div class="back_card_info">
    //
    //                                                 ${appendHtmlForWordInfo}
    //                                                 ${appendHtmlForWordBlocks}
    //
    //                                                 <div style="color: #707070;font-weight: 600;padding-bottom: 5px;">單字備註</div>
    //                                                 <div class="" style="color: #707070;min-height: 98px;border:1px solid #A4C1ED;border-radius: 10px;padding-top:5px;padding-left: 8px;padding-right: 8px;">${word_remarks}</div>
    //                                                 <br><br><br>
    //                                             </div>
    //                                         </div>
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                         </div>
    //
    //                   </div>
    //
    // `)

////
//     var wordInfo = JSON.parse(localStorage.getItem('word')).filter(function (item, index, array) {
//         return item.WordId == wordId
//     })
//
//     var word_theWord = wordInfo[0].TheWord
//     var word_audioPath = wordInfo[0].AudioPath
//     var word_remarks = wordInfo[0].Remarks
//
//     let wordInfo_filter_by_wordDef = {}
//
//     for (let i in wordInfo) {
//         if (!wordInfo_filter_by_wordDef[wordInfo[i].WordDefId]) {
//             wordInfo_filter_by_wordDef[wordInfo[i].WordDefId] = []
//             wordInfo_filter_by_wordDef[wordInfo[i].WordDefId].push(wordInfo[i])
//         } else {
//             wordInfo_filter_by_wordDef[wordInfo[i].WordDefId].push(wordInfo[i])
//         }
//     }
//
//
//     var appendHtmlForWordInfo = `<div class="back_card_word_title">${word_theWord}</div>`
//
//     ///
//     let appendHtmlForWordBlocks = ``
//     for (let i of Object.keys(wordInfo_filter_by_wordDef)) {
//         appendHtmlForWordBlocks += `<div class="back_card_word_block">`
//         appendHtmlForWordBlocks += `<div style="color: #707070;font-weight: 600;">解釋</div>
//                                     <div>
//                                         <span style="color:#E25A53;">[${wordInfo_filter_by_wordDef[i][0].Speech === null ? '' : wordInfo_filter_by_wordDef[i][0].Speech}] </span>
//                                         ${wordInfo_filter_by_wordDef[i][0].ChiDefinition}
//                                     </div>
//                                     <div style="color: #707070;font-weight: 600;">例句</div>`
//         let counter = 1
//         for (let j of wordInfo_filter_by_wordDef[i]) {
//             ///for sentences
//             if (j.EngSentence || j.ChiSentence) {
//                 appendHtmlForWordBlocks += `<div class="back_card_word_sen_eng">${counter}. ${j.EngSentence}</div>
//                                         <div class="back_card_word_def_chi">${j.ChiSentence}</div><br>
//                                         `
//                 counter = counter + 1
//             }
//         }
//         appendHtmlForWordBlocks += `</div>`
//     }
//
//     appendHtmlForWordBlocks = appendHtmlForWordBlocks.replaceAll(word_theWord, '<span class="word_highlight">' + word_theWord + '</span>')
//
//
//     let device_height = document.documentElement.clientHeight
//
//


}

var close_word = function (that) {
    $('#div_opacity').css('display','none')
    $('body').css('overflow-y', '')

}

var show_previous_word = function (word) {
    let wordIndex = wordListArray.findIndex(function (element) {
        return element == word
    })

    if (wordIndex > 0) {
        show_word(wordListArray[wordIndex - 1])
    } else {
        alert('前面沒有單字了')
    }
}

var show_next_word = function (word) {
    let wordIndex = wordListArray.findIndex(function (element) {
        return element == word
    })

    if (wordIndex < wordListArray.length - 1) {
        show_word(wordListArray[wordIndex + 1])
    } else {
        alert('後面沒有單字了')
    }
}

var page_go_back = function () {
    window.history.back();

}
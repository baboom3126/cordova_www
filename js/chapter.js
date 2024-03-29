var urlKeyValue = location.href.split('?')[1]
var splitUrlKeyValue = urlKeyValue.split('&')
var thisChapter = {}
let globalWordIdForCustomDeck

for (var i in splitUrlKeyValue) {
    var tempURL = splitUrlKeyValue[i].split('=')
    thisChapter[tempURL[0]] = tempURL[1]
}
var db = null
var filterDeck;
var wordListArray = []

let isFront = true

$(document).ready(function () {

    $('#switch_chineseDef').prop( "checked", localStorage.getItem('showChinese')=='true' )
    $('#switch_chineseDef').change(function(){
        const isChecked = this.checked
        if(isChecked==true){
            $('.span_chiDef').css('display','')
            $('.div_word_row').css('padding-left','20px')

            localStorage.setItem('showChinese','true')
        }
        else if(isChecked==false){
            $('.span_chiDef').css('display','none')
            $('.div_word_row').css('padding-left','30px')

            localStorage.setItem('showChinese','false')
        }
    })

    $('.modal').modal();

    $('#front_div-deck-card_align-middle').click(function () {
        console.log('front clicked')
        isFront = false
    })

    $('#div-deck-card_back').click(function () {
        isFront = true

    })

    document.addEventListener('deviceready', async function () {

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

        //localstorage textbookContentChapterDeck is deprecated
        //var textbookContentChapterDeck = JSON.parse(localStorage.getItem('textbookContentChapterDeck'))
        //var textbookContentChapterDeck = await getTccdArray()


//thisChapter.chapterId

        filterDeck = tccdRsToArray(await getTccdByChapters([thisChapter.chapterId]))
        showWordList(filterDeck)
        


        for (let i in filterDeck) {
            wordListArray.push(filterDeck[i].WordId)
        }

        
    })
})

var showWordList = function (data) {
    const showChinese = localStorage.getItem('showChinese')

    db.transaction(function (tx) {

        for (let i of data) {
            tx.executeSql('SELECT TheWord, ChiDefinition FROM word as w join worddef as wd on w.WordId = wd.WordId Where w.WordId = ? limit 1', [i.WordId], function (tx, rs) {

                let appendHtml = `    <div class="row div_word_row" onclick="javascript:show_word('${i.WordId}')" style="${showChinese=='true'?'padding-left:20px;':''}">
                            <div class="col s10">
                                <div class="">
                                ${rs.rows.item(0).TheWord}&nbsp&nbsp<span class="span_chiDef" style="${showChinese=='true'?'':'display:none;'}">${rs.rows.item(0).ChiDefinition}</span>
                                </div>

                            </div>
                            <div class="col s2" onclick="javascript:showCustomDeckListInModal(event,'${i.WordId}','${rs.rows.item(0).TheWord}')">
                                    <i class="material-icons" style="vertical-align: middle;">add</i>
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
        console.log('Query database OK');

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

    if (isFront === false) {
        $('#flip-container').click()
        isFront = true
    }

    $('#div_opacity').css('display', '')

    $('body').css('overflow-y', 'hidden')

    let queryWord = (wid) => new Promise((resolve, reject) => {
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
    let queryWordDef = (wid) => new Promise((resolve, reject) => {
        db.transaction(function (tx) {
            tx.executeSql(`SELECT WordDefId, ChiDefinition, Speech
                           FROM worddef
                           WHERE WordId = ?
                           ORDER BY Myorder`, [wid]
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


    $('#div_word_volumn_icon').attr('onclick', `javascript:replay_audio('${word_audioPath}','${escape(word_theWord)}')`)

    replay_audio(word_audioPath, word_theWord)

    let appendHtmlForWordInfo = `<div class="back_card_word_title">${word_theWord}</div>`
    let appendHtmlForWordBlocks = ``

    let queryWordDefResult = await queryWordDef(wordId)
    let thisWordSpeechSet = new Set()

    let CaptialFirstLetterWord = word_theWord.charAt(0).toUpperCase() + word_theWord.slice(1);

    let regex = null

    try{
        regex = new RegExp('(' + word_theWord + '|' + CaptialFirstLetterWord + ')', "g");
    }catch(error){
        console.log(error)
    }

    for (let i = 0; i < queryWordDefResult.length; i++) {
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
        for (let j = 0; j < queryWordSenResult.length; j++) {
            if (queryWordSenResult.item(j).EngSentence || queryWordSenResult.item(j).ChiSentence) {
                appendHtmlForWordBlocks += `<div class="back_card_word_sen_eng">${counter}. ${(queryWordSenResult.item(j).EngSentence).replace(regex, '<span class="word_highlight">' + word_theWord + '</span>')}</div>
                                        <div class="back_card_word_def_chi">${queryWordSenResult.item(j).ChiSentence}</div><br>
                                        `
                counter = counter + 1
            }
        }
        appendHtmlForWordBlocks += `</div>`

    }
    // appendHtmlForWordBlocks = appendHtmlForWordBlocks.replace(regex, '<span class="word_highlight">' + word_theWord + '</span>')

    let device_height = document.documentElement.clientHeight
    $('#div_previous_word').attr('onclick', `javascript:show_previous_word('${wordId}')`)
    $('#div_next_word').attr('onclick', `javascript:show_next_word('${wordId}')`)
    $('#flip-container').css('top', `${device_height * 0.15}px`)
    $('#front_div-deck-card_align-middle').css('height', `${device_height * 0.7}px`)
    $('#div-deck-card_back').css('height', `${device_height * 0.7}px`)
    $('#span_front_theWord').text(word_theWord)
    $('#div_front_speech').text(Array.from(thisWordSpeechSet).join(', '))
    $('#div_back_card_info_inner').html(appendHtmlForWordInfo + appendHtmlForWordBlocks)

    $('#div_back_word_remarks').text(word_remarks)


}

var close_word = function (that) {
    $('#div_opacity').css('display', 'none')
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

var replay_audio = function (word_audioPath, word) {

    if (word_audioPath != "null") {
        $('#audio_source').attr('src', word_audioPath)
        try {
            audio_word.load()
            audio_word.play()
        } catch (err) {
            var msg = new SpeechSynthesisUtterance(decodeURIComponent(word));
            window.speechSynthesis.speak(msg);
        }
    } else if (word_audioPath === "null") {
        var msg = new SpeechSynthesisUtterance(decodeURIComponent(word));
        window.speechSynthesis.speak(msg);
    }

}


const showCustomDeckListInModal = function(event,wordId,theWord){
    $('#modal-content_customDeck').html('')
    event.stopPropagation();

    console.log(`wordId: ${wordId}, theWord: ${theWord}`)
    $('#modal_header_h5').text(`將 ${theWord} 加入自訂字卡`)
    globalWordIdForCustomDeck = wordId
    //check weather this word is already in customDeck
    db.transaction(function (tx) {
        tx.executeSql(` SELECT 
                        customdeck.deckId, 
                        customdeck.deckName, 
                        customdecklist.wordId
                        FROM customdeck 
                        LEFT OUTER JOIN customdecklist 
                        ON customdeck.deckId = customdecklist.deckId AND customdecklist.wordId = ?;
        `, [wordId], function (tx, rs) {
            for(let i=0 ; i < rs.rows.length; i++){
                const deckId = rs.rows.item(i).deckId
                const deckName = rs.rows.item(i).deckName
                const rsWordId = rs.rows.item(i).wordId
                $('#modal-content_customDeck').append(`
                    <div class="row modal_row_customDeckList">
                        <div class="col s12">
                        <label>
                            <input type="checkbox" class="filled-in customDeckCheckBox" ${rsWordId==null?'':'checked="checked"'}/>
                            <span class="modal_checkBox_span" data-deckid="${deckId}" data-wordid="${wordId}">${deckName}</span>
                         </label>
                        </div>
                    </div> 
                `)
            }
        }, function (tx, error) {
            swal.fire('請回到首頁點選右上角重新更新資料');
        });

    }, function (error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function () {
        console.log('Query database OK');
        customDeckCheckBoxListener()
        $('#modal1').modal('open')

    });
    ///
    
}

const show_newCustomDeck = function(){
    $('#modal1').modal('close')
    let newUUID = generateUUID()
    Swal.fire({
        title: '新增自訂字卡堆',
        input: 'text',
        inputAttributes: {
          autocapitalize: 'off'
        },
        showCancelButton: false,
        confirmButtonText: '新增',
        showLoaderOnConfirm: true,
        preConfirm: (inputText) => {
            console.log(inputText)
            if(inputText!=''){
            db.transaction(function (tx) {
                 
                tx.executeSql('INSERT INTO customdeck (deckId,deckName) VALUES (?,?)', [newUUID,inputText], function (tx, rs) {


                    }, function (tx, error) {
                    swal.fire('資料庫錯誤:' + error.message);
                });

            }, function (error) {
                console.log('Transaction ERROR: ' + error.message);
            }, function () {
                console.log('Query database OK')
                $('#modal-content_customDeck').append(`
                <div class="row modal_row_customDeckList" >
                    <div class="col s12">
                    <label>
                        <input type="checkbox" class="filled-in customDeckCheckBox" id="newCustomDeck"/>
                        <span class="modal_checkBox_span" data-deckid="${newUUID}" data-wordid="${globalWordIdForCustomDeck}">${inputText}</span>
                     </label>
                    </div>
                </div> 
                `)
                newCustomDeckListener()
            })
            
            }else{
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: '請輸入自訂卡堆名稱'
                  })
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        
        $('#modal1').modal('open')

      })
}

const newCustomDeckListener = function(){
    $('#newCustomDeck').change(function() {
        const spanElement = $(this).parent().find('span')
        const wordId = spanElement.data('wordid')
        const deckId = spanElement.data('deckid')

        if ($(this).is(':checked')) {
            doCustomDeckListBy(deckId,wordId,'add')
        } else {
            doCustomDeckListBy(deckId,wordId,'del')
        }
      });
}

const customDeckCheckBoxListener = function(){

    $('.customDeckCheckBox').change(function() {
        const spanElement = $(this).parent().find('span')
        const wordId = spanElement.data('wordid')
        const deckId = spanElement.data('deckid')

        if ($(this).is(':checked')) {
            doCustomDeckListBy(deckId,wordId,'add')
        } else {
            doCustomDeckListBy(deckId,wordId,'del')
        }
      });
      
}

const doCustomDeckListBy = function(deckId,wordId,action){

    if(action == 'add'){
        db.transaction(function (tx) {

            tx.executeSql('INSERT INTO customdecklist (deckId,wordId) VALUES (?,?)', [deckId, wordId], function (tx, rs) {
                }, function (tx, error) {
                swal.fire('資料庫錯誤:' + error.message);
            });
    
        }, function (error) {
            console.log('新增自訂卡堆失敗' + error.message);
        }, function () {
            console.log(`Successfully Add deckId: ${deckId}, wordId: ${wordId}`);
            M.toast({html: '新增成功',displayLength: 800})
        });
    }else if (action=='del'){
        db.transaction(function (tx) {

            tx.executeSql('DELETE FROM customdecklist WHERE deckId = ? and wordId = ?', [deckId, wordId], function (tx, rs) {
                }, function (tx, error) {
                swal.fire('資料庫錯誤:' + error.message);
            });
    
        }, function (error) {
            console.log('移除自訂卡堆失敗' + error.message);
        }, function () {
            console.log(`Successfully Del deckId: ${deckId}, wordId: ${wordId}`);
            M.toast({html: '移除成功',displayLength: 800})

        });
    }


}
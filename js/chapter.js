var urlKeyValue = location.href.split('?')[1]
var splitUrlKeyValue = urlKeyValue.split('&')
var thisChapter = {}
for (var i in splitUrlKeyValue) {
    var tempURL = splitUrlKeyValue[i].split('=')
    thisChapter[tempURL[0]] = tempURL[1]
}

var filterDeck;
var wordListArray = []

$(document).ready(function () {

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

var showWordList = function (data) {

    var wordIdAndNamepair = {}
    var wordJSON = JSON.parse(localStorage.getItem('word'))
    for (let i of data) {
        wordJSON.find(element => {
            if (element.WordId == i.WordId) {
                wordIdAndNamepair[i.WordId] = element.TheWord
            }
        })
    }
    console.log(wordIdAndNamepair)
    var appendHtml = ``
    for (let i in data) {
        appendHtml += `    <div class="row div_word_row" onclick="javascript:show_word('${data[i].WordId}')">
                            <div class="col s10">
                                <div class="">
                                ${wordIdAndNamepair[data[i].WordId]}
                                </div>

                            </div>
                            <div class="col s2">
                                <div class="div_word_element_right">
<!--                                    <img src="./img/main/iconSTAR@3x.png" height="16">-->
<!--                                    <img src="./img/main/iconSTAR_selected@3x.png" height="16">-->

                                </div>
                            </div>
                        </div>`
    }
    $('#div_word_list').html(appendHtml)
}

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
        appendHtmlForWordBlocks += `<div style="color: #707070;font-weight: 600;">解釋</div>
                                    <div>
                                        <span style="color:#E25A53;">[${wordInfo_filter_by_wordDef[i][0].Speech === null ? '' : wordInfo_filter_by_wordDef[i][0].Speech}] </span>
                                        ${wordInfo_filter_by_wordDef[i][0].ChiDefinition}
                                    </div>
                                    <div style="color: #707070;font-weight: 600;">例句</div>`
        let counter = 1
        for (let j of wordInfo_filter_by_wordDef[i]) {
            ///for sentences
            if (j.EngSentence||j.ChiSentence) {
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
                            <div class="div_previous_word waves-effect" onclick="javascript:show_previous_word('${wordId}')"><img src="./img/btn/buttonBACK@3x.png" height="41" width="41"></div>                            
                            <div class="div_next_word waves-effect" onclick="javscript:show_next_word('${wordId}')"><img src="./img/btn/buttonNEXT@3x.png" height="41" width="41"></div>

                            <div class="flip-container" onclick="this.classList.toggle('hover');" style="top:${device_height * 0.15}px">
                                    <div class="flipper">
                                        <div class="front div-deck-card align-middle" style="height:${device_height * 0.7}px;">
                                            <div style="top:42%;position:relative;text-align: center;color: #7193C4;font-size: 26px;font-weight: 600 ;">
                                                ${word_theWord}<br>
                                                <div style="font-size: 14px;font-weight: normal;color: #E25A53;">${wordInfo[0].Speech === null ? '' : wordInfo[0].Speech}</div>
                                            </div>

                                        </div>
                                        <div class="back div-deck-card" style="height:${device_height * 0.7}px;">
                                            <div class="row">
                                                <div class="back_card_info">
                                                
                                                    ${appendHtmlForWordInfo}
                                                    ${appendHtmlForWordBlocks}
                                                
                                                    <div style="color: #707070;font-weight: 600;padding-bottom: 5px;">單字備註</div>
                                                    <div class="" style="color: #707070;min-height: 98px;border:1px solid #A4C1ED;border-radius: 10px;padding-top:5px;padding-left: 8px;padding-right: 8px;">${wordInfo[0].Remarks}</div>
                                                    <br><br><br>
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

var show_previous_word = function (word) {
    let wordIndex = wordListArray.findIndex(function (element) {
        return element == word
    })

    if (wordIndex > 0) {
        $('#div_opacity').remove()
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
        $('#div_opacity').remove()
        show_word(wordListArray[wordIndex + 1])
    } else {
        alert('後面沒有單字了')
    }
}

var page_go_back = function () {
    window.history.back();

}
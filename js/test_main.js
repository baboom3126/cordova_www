let classJSON = JSON.parse(localStorage.getItem('class'))
let textbookJSON = JSON.parse(localStorage.getItem('textbook'))
let classTextbookJSON = JSON.parse(localStorage.getItem('classTextbook'))

$(document).ready(function () {


    show_class(classJSON)


})

let show_class = function (classJSON) {

    for (let i in classJSON) {
        let optionElement = document.createElement('option')
        $(optionElement).val(classJSON[i].ClassId)
        $(optionElement).text(classJSON[i].ClassName)
        $('#select_class').append(optionElement)
    }
}

let show_textbook = function (classId) {

    $('#select_textbook').html(`<option value="" disabled selected>選擇教材</option>`)

    let filterClassTextbook = classTextbookJSON.filter(function (item, index, array) {
        return item.ClassId == classId
    })
    let filterTextbook = textbookJSON.filter(function (item, index, array) {
        for (let i in filterClassTextbook) {
            if (filterClassTextbook[i].TextbookId == item.TextbookId) {
                return item
            }
        }
    })
    for (let i in filterTextbook) {
        let optionElement = document.createElement('option')
        $(optionElement).val(filterTextbook[i].TextbookId)
        $(optionElement).text(filterTextbook[i].TextbookName)
        $('#select_textbook').append(optionElement)
    }
}

let showTextbookContentAndChapter = function () {

}

$('#select_class').change(function (event) {
    let selectedClassId = $('#select_class').val()

    $('#div_textbookInfo').html('')

    show_textbook(selectedClassId)

})

$('#select_textbook').change(function (event) {
    let selectedTextbookId = $('#select_textbook').val()

    let textbookContentJSON = JSON.parse(localStorage.getItem('textbookContent'))

    let filterTextbookContent = textbookContentJSON.filter(function (item, index, array) {
        return item.TextbookId == selectedTextbookId
    })

    let textbookContentChapterJSON = JSON.parse(localStorage.getItem('textbookContentChapter'))

    let filterTextbookContentChapter = textbookContentChapterJSON.filter(function (item, index, array) {
        for (let i in filterTextbookContent) {
            if (filterTextbookContent[i].TextbookContentId == item.TextbookContentId) {
                return item
            }
        }
    })


    showDivTextbookInfos(filterTextbookContentChapter)


})

let showDivTextbookInfos = function (data) {

    var temp = {}
    for (var i in data) {
        if (temp[data[i].TextbookContentId] == undefined) {
            temp[data[i].TextbookContentId] = []
            temp[data[i].TextbookContentId].push(data[i])
        } else {
            temp[data[i].TextbookContentId].push(data[i])

        }
    }
    var appendHTML = ``
    for (var i of Object.keys(temp)) {
        appendHTML += `    
                        <li>
                            <div class="collapsible-header">
                                <label>
                                    <input class="filled-in input_textbookContent" type="checkbox" data="${temp[i][0].TextbookContentId}"/>
                                    <span style="font-weight: 600;">${temp[i][0].TextbookContentName}</span>
                                </label>
                                <span class="arrow_chapter_header"></span>
                            </div>
                            <div class="collapsible-body">
                        `

        var tempHTML = ``

        for (var j of temp[i]) {
            appendHTML += `
                <div class="div_checkbox_chapter">
                    <label>
                        <input class="filled-in input_textbookContentChapter" type="checkbox" data="${j.TextbookContentChapterId}"/>
                        <span class="span_for_chapter">${j.TextbookContentChapterName}</span>
                    </label>

                </div>
`
        }

        appendHTML += `    
            </div>
        </li>
    `
    }


    $('#div_textbookInfo').html(appendHTML)

    // var elem = document.querySelector('.collapsible.expandable');
    // var instance = M.Collapsible.init(elem, {
    //     accordion: true
    // });
    // instance.open()
    checkboxCheckedEvent()
}


let checkboxCheckedEvent = function () {
    $('.input_textbookContent').change(function (event) {

        let tcID = $(this).attr('data')
        console.log('textbookContent clicked ' + tcID)
        let divChapters = $($(this).parent().parent().parent().children(".collapsible-body")).children()
        if ($(this).prop('checked')) {

            for (let element of divChapters) {
                let inputElement = $(element).children().children("input")
                inputElement.prop('checked', true)
            }
        } else {

            for (let element of divChapters) {
                let inputElement = $(element).children().children("input")
                inputElement.prop('checked', false)
            }
        }


    })

    $('.input_textbookContentChapter').change(function (event) {
        let tccID = $(this).attr('data')

    })
}


$('#a_nextPage').click(function () {

    localStorage.removeItem('test_chapters')
    let test_chapters = []
    let checkboxes_textbookContentChapter = $('.input_textbookContentChapter')

    if (checkboxes_textbookContentChapter.length == 0) {
        swal.fire('請選擇班級、教材')

    } else {
        let flag = false
        for (let element of $(checkboxes_textbookContentChapter)) {
            if ($(element).prop('checked')) {
                test_chapters.push($(element).attr('data'))
                flag = true
            }
        }
        if (flag) {
            //////////then check the word in test_chapters is empty or not

            let textbookContentChapterDeck = JSON.parse(localStorage.getItem('textbookContentChapterDeck'))

            let arrayForEmptyChapter = []

            for (let chapterId of test_chapters) {
                let filterChapterDeck = textbookContentChapterDeck.filter(function (item, index, array) {
                    return item.TextbookContentChapterId == chapterId
                })
                console.log(filterChapterDeck)
                if (filterChapterDeck.length == 0) {
                    arrayForEmptyChapter.push(chapterId)
                }
            }
            if (arrayForEmptyChapter.length == 0) {
                ////all not empty
                localStorage.setItem('test_chapters', test_chapters)
                location.href = './test_mode_select.html'
            } else {
                ////one or more is empty
                let textbookContentChapter = localStorage.getItem('textbookContentChapter')

                let arrayForEmptyChapterGetName = []
                for (let id of arrayForEmptyChapter) {
                    let filterTCC = JSON.parse(textbookContentChapter).filter(function (item, index, array) {
                        return item.TextbookContentChapterId == id
                    })
                    for(let i in filterTCC){
                        arrayForEmptyChapterGetName.push(filterTCC[i].TextbookContentChapterName)
                    }

                }

                swal.fire(`選擇章節無內容: <br>`+arrayForEmptyChapterGetName.join('、<br>'))
            }


        } else {
            swal.fire('請選擇教材章節')

        }
    }

})

var studentId;

var db = null;


$(document).ready(function () {
    $('.sidenav').sidenav();


    document.addEventListener('deviceready', function () {

        if(cordova.platformId==="browser"){
            db= openDatabase('word', '1.0', 'wordDB', 50*1024*1024);
        }else{
            db = window.sqlitePlugin.openDatabase({
                name: 'word',
                location: 'default',
            });
        }



        let studentInfo = JSON.parse(localStorage.getItem("student"))
        studentId = studentInfo.studentId
        $('#nav_student_name').html('&nbsp&nbsp' + studentInfo.name)

        $('#side_nav_name').text(studentInfo.name)
        $('#side_nav_email').text(studentInfo.email)

        if (localStorage.getItem('class') == null) {
            downloadAllData()
        } else {
            index_show_class_list()

            let postData = {}
            postData.studentId = studentId
            var settings = {
                "async": true,
                "crossDomain": true,
                "url": baseUrl + "app/v2/getVersion",
                "method": "POST",
                "headers": {
                    "content-type": "application/json",
                    "cache-control": "no-cache",
                }, data: JSON.stringify(postData)
            }

            $.ajax(settings).done(function (response, status) {
                if (response.code != 500) {
                    let serverVersion = response.version
                    let localVersion = JSON.parse(localStorage.getItem('version')).version
                    if (serverVersion != localVersion) {

                        Swal.fire({
                            title: '有最新資料可下載',
                            showDenyButton: true,
                            showCancelButton: false,
                            confirmButtonText: `下載`,
                            denyButtonText: `取消`,
                        }).then((result) => {
                            console.log(result)
                            if (result.isConfirmed) {
                                swal.fire({
                                    title: '請稍後',
                                    text: '更新資料中...',
                                    allowOutsideClick: false,
                                    allowEscapeKey: false,
                                    allowEnterKey: false,
                                    onOpen: () => {
                                        downloadAllData()
                                    }
                                })

                            }
                        })
                    }
                }
            })


        }
        // downloadAllData()
    });
})

var downloadAllData = function () {



    swal.showLoading()
    let postData = {}
    postData.studentId = studentId
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": baseUrl + "app/v2/downloadAllData",
        "method": "POST",
        "headers": {
            "content-type": "application/json",
            "cache-control": "no-cache",
        },
        data: JSON.stringify(postData)
    }

    $.ajax(settings).done(function (response) {
        console.log(response)
        var code = response.code
        if (code != 200) {
            swal.fire('伺服器維修中')
        } else {

            localStorage.setItem("class", JSON.stringify(response.data["class"]))
            localStorage.setItem("classTextbook", JSON.stringify(response.data["classTextbook"]))
            localStorage.setItem("textbook", JSON.stringify(response.data["textbook"]))
            localStorage.setItem("textbookContent", JSON.stringify(response.data["textbookContent"]))
            localStorage.setItem("textbookContentChapter", JSON.stringify(response.data["textbookContentChapter"]))
            localStorage.setItem("textbookContentChapterDeck", "")
            localStorage.setItem("version", JSON.stringify(response.data["version"]))

            db.transaction(function (tx) {
                tx.executeSql("DROP TABLE If Exists word")
                tx.executeSql("DROP TABLE If Exists worddef")
                tx.executeSql("DROP TABLE If Exists wordsen")
                tx.executeSql("DROP TABLE If Exists textbookContentChapterDeck")



                tx.executeSql('CREATE TABLE IF NOT EXISTS word (WordId, TheWord,Status,Remarks,AudioPath)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS worddef (WordDefId, WordId,ChiDefinition,Speech,Myorder,Status)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS wordsen (WordSenId, WordDefId,ChiSentence,EngSentence,Myorder,Status)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS textbookContentChapterDeck (TextbookContentChapterId, WordId)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS customdeck (deckId, deckName)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS customdecklist (deckId,wordId)');

                for (let word of response.data["word"]) {
                    tx.executeSql('INSERT INTO word (WordId, TheWord,Status,Remarks,AudioPath) VALUES (?,?,?,?,?)',
                        [word.WordId, word.TheWord,word.Status,word.Remarks,decodeURIComponent(word.AudioPath)]);

                }
                for (let worddef of response.data["worddef"]) {
                    tx.executeSql('INSERT INTO worddef (WordDefId, WordId,ChiDefinition,Speech,Myorder,Status) VALUES (?,?,?,?,?,?)',
                        [worddef.WordDefId,worddef.WordId,worddef.ChiDefinition,worddef.Speech,worddef.Myorder,worddef.Status]);

                }
                for (let wordsen of response.data["wordsen"]) {
                    tx.executeSql('INSERT INTO wordsen (WordSenId, WordDefId,ChiSentence,EngSentence,Myorder,Status) VALUES (?,?,?,?,?,?)',
                        [wordsen.WordSenId,wordsen.WordDefId,wordsen.ChiSentence,wordsen.EngSentence,wordsen.Myorder,wordsen.Status]);

                }
                for (let tccd of response.data["textbookContentChapterDeck"]){
                    tx.executeSql('INSERT INTO textbookContentChapterDeck (TextbookContentChapterId,WordId) VALUES (?,?)',
                        [tccd.TextbookContentChapterId,tccd.WordId]);
                }

            }, function (error) {
                console.log('Transaction ERROR: ' + error.message);
            }, function () {
                console.log('Populated database OK');

            });


            Swal.fire({
                title: '資料下載完成',
                showDenyButton: false,
                showCancelButton: false,
                confirmButtonText: `確定`,
                denyButtonText: `No`,
            }).then((result) => {
                location.reload()
            })
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.log('[FAIL] ')
        swal.fire('沒有網路連線<br>或<br>伺服器維修中')
        console.log(jqXHR)
        console.log(textStatus)
        console.log(errorThrown)

    })
}

var show_add_class = function(){
    console.log(`show_add_class`)
    Swal.fire({
        title: '請輸入班級代碼',
        input: 'text',
        inputAttributes: {
          autocapitalize: 'off',
          class: 'center-align' 

        },
        customClass: {
            input: 'center-align'
          },
        showCancelButton: true,
        confirmButtonText: '確認',
        cancelButtonText:'取消',
        showLoaderOnConfirm: true,
        preConfirm: (classCode) => {
            console.log('[AJAX] newClassStudentByCLassCode')
            let postData = {}
            postData.studentId = studentId
            postData.classCode = classCode
            var settings = {
                "async": true,
                "crossDomain": true,
                "url": baseUrl + "app/newClassStudentByCLassCode",
                "method": "POST",
                "headers": {
                    "content-type": "application/json",
                    "cache-control": "no-cache",
                },
                data: JSON.stringify(postData)
            }
    
            $.ajax(settings).done(function (response) {
                console.log(response)
                var code = response.code
                if (code != 200) {
                    swal.fire('伺服器維修中')
                } else {
                    if (response.message == "multiple class") {
                        swal.fire('已有相同的班級')
                    }else if(response.message == "not found"){
                        swal.fire('邀請碼錯誤')
                    } else {
                        let data = response.data.queryClassBySid
    
                        localStorage.setItem('classList', JSON.stringify(data))
                        Swal.fire({
                            title: '加入成功',
                            showDenyButton: false,
                            showCancelButton: false,
                            confirmButtonText: `確定`,
                            denyButtonText: `No`,
                        }).then((result) => {
                            /* Read more about isConfirmed, isDenied below */
                            
                                swal.fire({
                                    title: '請稍後',
                                    text: '更新資料中...',
                                    allowOutsideClick: false,
                                    allowEscapeKey: false,
                                    allowEnterKey: false,
                                    onOpen: () => {
                                        downloadAllData()
                                    }
                                })
                    
                            
                            
                         
                        })
                    }
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.log('[FAIL] ')
                // swal.fire('沒有網路連線')
                console.log(jqXHR)
                console.log(textStatus)
                console.log(errorThrown)
    
            });

        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        console.log(result)
      })
}

// Swal.showValidationMessage(
//     `Request failed: ${error}`
//   )


var join_class = function () {

    let classCode = $('#classCode').val()
    if (classCode == "") {
        swal.fire('請輸入班級代碼')
    } else {
        console.log('[AJAX] newClassStudentByCLassCode')
        let postData = {}
        postData.studentId = studentId
        postData.classCode = classCode
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": baseUrl + "app/newClassStudentByCLassCode",
            "method": "POST",
            "headers": {
                "content-type": "application/json",
                "cache-control": "no-cache",
            },
            data: JSON.stringify(postData)
        }

        $.ajax(settings).done(function (response) {
            console.log(response)
            var code = response.code
            if (code != 200) {
                swal.fire('伺服器維修中')
            } else {
                if (response.message == "multiple class") {
                    swal.fire('已有相同的班級')
                } else {
                    let data = response.data.queryClassBySid

                    localStorage.setItem('classList', JSON.stringify(data))
                    Swal.fire({
                        title: '加入成功',
                        showDenyButton: false,
                        showCancelButton: false,
                        confirmButtonText: `確定`,
                        denyButtonText: `No`,
                    }).then((result) => {
                        /* Read more about isConfirmed, isDenied below */
                        if (result.isConfirmed) {
                            location.reload()
                        }
                    })
                }
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.log('[FAIL] ')
            // swal.fire('沒有網路連線')
            console.log(jqXHR)
            console.log(textStatus)
            console.log(errorThrown)

        });
    }
}


var index_show_class_list = function () {


    var classJson = JSON.parse(localStorage.getItem('class'))
    var appendHtmlForClassList = ``
    for (let i in classJson) {
        appendHtmlForClassList +=
            `        <div class="col s12">
                            <a href="class.html?classId=${classJson[i].ClassId}&className=${classJson[i].ClassName}" class="card no_shadow" style="margin-bottom: 0px;">

                            <div class="row">
                                <div class="col s2">
                                    <div class="class_list_left color_${parseInt(i) % 6}">
                                        ${classJson[i].ClassName.charAt(0)}
                                    </div>                                
                                </div>
                                <div class="col s10">
                                <div class="class_list_right">
                                     <div class="list_of_class_name">${classJson[i].ClassName}&nbsp</div>
                                     <div class="list_of_class_des">${classJson[i].ClassDescription}&nbsp</div>
                                </div>
                                </div>
                            </div>
                            </a>
                        </div>
                `

    }
    $('#div_classList').html(appendHtmlForClassList)
}

var test = function () {
    db.transaction(function (tx) {
        tx.executeSql('SELECT count(*) AS mycount FROM worddef', [], function (tx, rs) {
            alert('Record count (expected to be 2): ' + rs.rows.item(0).mycount);
        }, function (tx, error) {
            alert('SELECT error: ' + error.message);
        });
    });
}

var show_student_info = function () {
    var student = JSON.parse(localStorage.getItem('student'))
    swal.fire(`${student.email}`)
}
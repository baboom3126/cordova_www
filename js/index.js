var studentId;

var db = null;


$(document).ready(function () {


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
                                downloadAllData()

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

    db.transaction(function (tx) {
        tx.executeSql("DROP TABLE If Exists word")
        tx.executeSql("DROP TABLE If Exists worddef")
        tx.executeSql("DROP TABLE If Exists wordsen")
    }, function (error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function () {
        console.log('drop table successfully');
    });


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
            localStorage.setItem("textbookContentChapterDeck", JSON.stringify(response.data["textbookContentChapterDeck"]))
            localStorage.setItem("version", JSON.stringify(response.data["version"]))

            db.transaction(function (tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS word (WordId, TheWord,Status,Remarks,AudioPath)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS worddef (WordDefId, WordId,ChiDefinition,Speech,Myorder,Status)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS wordsen (WordSenId, WordDefId,ChiSentence,EngSentence,Myorder,Status)');

                for (let word of response.data["word"]) {
                    tx.executeSql('INSERT INTO word (WordId, TheWord,Status,Remarks,AudioPath) VALUES (?,?,?,?,?)',
                        [word.WordId, word.TheWord,word.Status,word.Remarks,word.AudioPath]);

                }
                for (let worddef of response.data["worddef"]) {
                    tx.executeSql('INSERT INTO worddef (WordDefId, WordId,ChiDefinition,Speech,Myorder,Status) VALUES (?,?,?,?,?,?)',
                        [worddef.WordDefId,worddef.WordId,worddef.ChiDefinition,worddef.Speech,worddef.Myorder,worddef.Status]);

                }
                for (let wordsen of response.data["wordsen"]) {
                    tx.executeSql('INSERT INTO wordsen (WordSenId, WordDefId,ChiSentence,EngSentence,Myorder,Status) VALUES (?,?,?,?,?,?)',
                        [wordsen.WordSenId,wordsen.WordDefId,wordsen.ChiSentence,wordsen.EngSentence,wordsen.Myorder,wordsen.Status]);

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
        // swal.fire('沒有網路連線')
        console.log(jqXHR)
        console.log(textStatus)
        console.log(errorThrown)

    })
}


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
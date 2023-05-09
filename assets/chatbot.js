let INDEX = 0;
const base_url = document.currentScript.dataset.baseUrl;
const audioEnabled = document.currentScript.dataset.audioEnabled;
let option_master_ticket = '<option value="">เลือก</option>';
chatboxJq(function () {
    chatboxJq('body').prepend(modal_chatbot).ready(function () {
        init_scroll()
    });
    if (audioEnabled !== undefined && audioEnabled === 'true') {
        chatboxJq('body').prepend(welcome_sound_str);
        chatboxJq(document).on('mouseover', "#chat-circle", function () {
            if (audioEnabled) {
                audios = document.querySelectorAll('audio');
                welcome_sound = document.getElementById('welcome_sound');
                [].forEach.call(audios, function () {
                    welcome_sound.play();
                });
            }
        });

        chatboxJq(document).on('mouseleave', "#chat-circle", function () {
            if (audioEnabled) {
                welcome_sound = document.getElementById('welcome_sound');
                welcome_sound?.pause();
                welcome_sound.currentTime = 0;
            }
        });
    }

    chatboxJq('body').prepend(chat_circle);

    chatboxJq('#chatbot-wcf').on('shown.bs.modal', function () {
        chatboxJq(this).children('.modal-dialog').css('right', 0)
        chatboxJq(this).addClass('show');
    });

    chatboxJq('#chatbot-wcf').on('hidden.bs.modal', function (e) {
        chatboxJq(this).children('.modal-dialog').css('right', '-600px')
        chatboxJq(this).removeClass('show');
    });

    if (sessionStorage.getItem("username_display")) {
        chatboxJq("#username_display").text(sessionStorage.getItem("username_display"))
    }

    chatboxJq("#chat-submit").click(function (e) {
        e.preventDefault();
        var msg = chatboxJq("#chat-input").val();
        if (msg.trim() == '') {
            return false;
        }

        let param = {}
        param.text = msg
        param.timestamp = moment().unix()


        generate_message(param);

        waitingBot()
        scrollToLastMsg()
        chatboxJq('#chat-input').val('')


        apiSendMessage(msg, '', function (result) {
            var t = result.response

            for (const [key, value] of Object.entries(t)) {
                value.timestamp = moment().unix()
                generate_message_response(value)
                scrollToLastMsg()
            }
            chatboxJq('#cm-msg-waiting').remove()
        })

    });

    chatboxJq(document).on('click', '.cm-button', function () {
        let text = chatboxJq(this).text()
        let payload = chatboxJq(this).data('payload')
        let param = {}
        param.text = text
        param.timestamp = moment().unix()

        generate_message(param);
        waitingBot()
        scrollToLastMsg()
        apiSendMessage(text, payload, function (result) {
            var t = result.response
            for (const [key, value] of Object.entries(t)) {
                value.timestamp = moment().unix()
                generate_message_response(value)
                scrollToLastMsg()
            }
            chatboxJq('#cm-msg-waiting').remove()
        })
    });

    chatboxJq(".chat-box-toggle").click(function () {
        chatboxJq('#chatbot-wcf').modal('hide');
    });

    chatboxJq('#chatbot-wcf').on('hidden.bs.modal', function () {
        chatboxJq("#chat-circle").show();
    });

    chatboxJq(document).on('click', "#chat-circle", function () {

        removeFormTicket();

        chatboxJq(".chat-logs").html('')



        if (!sessionStorage.getItem("chat_secret") || sessionStorage.getItem("chat_secret") == "undefined") {

            start_conversation(function (rs) {
                console.log(rs);
                if (rs) {
                    chatboxJq('#chatbot-wcf').modal('show');

                    get_messgae_history(function (rs2) {
                        if (rs2) {
                            page++;
                        } else {
                            load = true
                        }

                        setTimeout(
                            function () {
                                chatboxJq(".chat-logs").stop().animate({ scrollTop: chatboxJq(".chat-logs")[0].scrollHeight }, 0);
                            }, 500
                        )
                    })

                    masterTicket(function (resp) {
                        for (var key in resp) {
                            option_master_ticket += '<option value="' + resp[key].id + '">' + resp[key].name + '</option>'
                        }
                    })
                } else {

                    setTimeout(() => {

                        chatboxJq('#chatbot-wcf').modal('hide');
                    }, 500);

                }
            })
        } else {

            chatboxJq('#chatbot-wcf').modal('show');


            masterTicket(function (resp) {
                for (var key in resp) {
                    option_master_ticket += '<option value="' + resp[key].id + '">' + resp[key].name + '</option>'
                }
            })
            get_messgae_history(function (rs2) {

                console.log('rs2', rs2)
                if (rs2) {
                    page++;
                } else {
                    load = true
                }

                setTimeout(
                    function () {
                        chatboxJq(".chat-logs").stop().animate({ scrollTop: chatboxJq(".chat-logs")[0].scrollHeight }, 0);
                    }, 500
                )
            })
        }


    })
});

function init_scroll() {
    const scroller = document.querySelector(".chat-logs");

    scroller.addEventListener("scroll", (event) => {

        if (scroller.scrollTop <= 300 && !load) {
            load = true
            var last_msg_index = INDEX
            console.log(last_msg_index)
            // console.log(last_msg_index + 1)
            get_messgae_history(function (rs3) {
                console.log('rs3', rs3)
                if (rs3) {
                    page++
                    load = false
                } else {
                    date_show('')
                }


            })
        }
    });
}


let load = false
var first_date_display = '';
var lastest_date_display = ''

function date_show(timestamp, method = 'prepend') {
    let last_date_chat = moment.unix(timestamp).format("DD MMMM, YYYY")


    if (lastest_date_display == '') {
        lastest_date_display = last_date_chat
        first_date_display = last_date_chat
        console.log('A')

    } else if (method == 'prepend' && first_date_display !== last_date_chat) {
        var str = "<div class='cm-chatdate'><span class='chat-date'>" + first_date_display + "</span></div>";
        first_date_display = last_date_chat
        chatboxJq(".chat-logs").prepend(str);
        console.log('B')
    } else if (method == 'append' && lastest_date_display !== last_date_chat) {
        var str = "<div class='cm-chatdate'><span class='chat-date'>" + lastest_date_display + "</span></div>";
        chatboxJq(".chat-logs").append(str);
        lastest_date_display = last_date_chat
        console.log('C')
    }
}

function init_carousel() {
    chatboxJq('.suggest-owl').owlCarousel({
        loop: false,
        autoWidth: true,
        autoHeight: true,
        autoHeightClass: 'owl-height',
        nav: false,
        dots: false,
        // stagePadding: 22,
        margin: 5,
        items: 2
    });

}

function urlify(message) {


    if (!message) return;

    var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    return message.replace(urlRegex, function (url) {
        var hyperlink = url.replace(/,\s*$/, "");

        if (!hyperlink.match('^https?:\/\/')) {
            hyperlink = 'http://' + hyperlink;
        }

        return '<a href="' + hyperlink + '" target="_blank" rel="noopener noreferrer">' + url + '</a>'
    });
}

function scrollToLastMsg() {
    chatboxJq(".chat-logs").stop().animate({ scrollTop: chatboxJq(".chat-logs")[0].scrollHeight }, 0);
}


function calwidth() {
    var wid = chatboxJq(window).width()
    const wid_chatbox = 30 / 100
    const wid_msg = 75 / 100
    if (wid > 768) {
        if (wid * wid_chatbox < 320) {
            wid = 320
        } else {
            wid = (wid * wid_chatbox)
        }
    }

    return (wid * wid_msg) - 30
}

function generate_message_response(data, history = false) {
    INDEX++;

    var str = "";
    str += '<div id="cm-msg-' + INDEX + '" class="chat-msg user">'
    str += '<span class="msg-avatar">';
    str += `<img src="${base_url}/assets/widget/images/icon-chat.png">`;
    str += "</span>";
    let has_carousel = false;
    if (data.buttons) {

        var choice_size = 4
        if (data.buttons.length % choice_size == 1) {
            choice_size++;
        }


        var width_ = calwidth()
        if (data.buttons.length > choice_size) {
            has_carousel = true;
            let total_page = Math.ceil(data.buttons.length / choice_size)
            str += '<div id="" class="suggest-owl owl-carousel owl-theme" data-ride="carousel " data-interval="10000000">';

            for (var i = 1; i <= total_page; i++) {
                str += '<div class="cm-msg-text" style="width:' + width_ + 'px">';
                str += data.text + "<div style='margin-bottom:10px'></div>";

                var start = choice_size * (i - 1);
                for (var j = start; j < choice_size * i; j++) {
                    if (j < data.buttons.length) {
                        str += '<div class="cm-button" data-payload="' + data.buttons[j].payload + '">' + data.buttons[j].title + '</div>'
                    }
                }
                str += "</div>";
            }
            str += '</div>'
        } else {

            str += '<div class="cm-msg-text">';
            str += data.text + "<div style='margin-bottom:10px'></div>";
            for (var j = 0; j < data.buttons.length; j++) {
                str += '<div class="cm-button" data-payload="' + data.buttons[j].payload + '">' + data.buttons[j].title + '</div>'
            }
            str += "</div>";
        }

    } else if (data.text) {
        str += '<div class="cm-msg-text">';
        str += urlify(data.text);
        str += '</div>';
    }
    if (data.image) {
        if (data.text) {
            str += '<div class="cm-msg-image" style="margin-left:45px">';
        } else {
            str += '<div class="cm-msg-image">';
        }

        str += '<img src="' + data.image + '">'
        str += '</div>';
    }


    str += "<div class='chat-time left'>" + moment.unix(data.timestamp).format("HH:mm"); + "</div>"
    str += '</div>' //.chat-msg


    if (history) {
        date_show(data.timestamp, 'prepend')
        chatboxJq(".chat-logs").prepend(str.replace(/\n/g, "<br />"));
    } else {
        date_show(data.timestamp, 'append')
        chatboxJq(".chat-logs").append(str.replace(/\n/g, "<br />"));
    }

    if (has_carousel) {
        init_carousel();
    }
}

function waitingBot(type = 'user') {

    var str = "";
    str += "<div id='cm-msg-waiting' class=\"chat-msg " + type + "\">";
    str += "          <span class=\"msg-avatar\">";
    str += `            <img src='${base_url}/assets/widget/images/icon-chat.png'>`;
    str += "          <\/span>";

    str += "          <div class=\"cm-msg-text\">";
    str += '<div class="typewriter">............</div>';
    str += "          <\/div>";
    str += "        <\/div>";

    chatboxJq(".chat-logs").append(str);

    chatboxJq("#cm-msg-waiting").fadeIn(300);

    chatboxJq(".chat-logs").append('<div style="clear:both"></div>');

}


function generate_message(data, history = false) {

    INDEX++;
    var str = "";
    str += '<div id="cm-msg-' + INDEX + '" class="chat-msg self">'
    str += '<div class="cm-msg-text">';
    str += data.text;
    str += "</div>";


    str += "<div class='chat-time right'>" + moment.unix(data.timestamp).format("HH:mm"); + "</div>"
    str += "        <\/div>";

    if (history) {
        date_show(data.timestamp, 'prepend')
        chatboxJq(".chat-logs").prepend(str);
    } else {
        date_show(data.timestamp, 'append')
        chatboxJq(".chat-logs").append(str);
    }
}

function handleErrors(response) {

    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

function logout() {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("chat_secret");
    sessionStorage.removeItem("username_display");
    window.location.href = "index.html"
}

function get_messgae_history(callback) {

    apiChatHistory(function (result) {
        if (result.total > 0) {
            var t = result.response
            for (const [key, value] of Object.entries(t)) {
                if (value.type_name == 'bot') {
                    generate_message_response(value, true)
                } else {
                    generate_message(value, true);
                }
            }
        }

        if (result.total == limit) {
            callback(true)
        } else {
            callback(false)
        }
    })
}

var chat_circle = `
<div id="chat-circle">
    <img id="chat-img" src="${base_url}/assets/widget/images/chaticon3.png" style="width:80px;">

    <div id="chat-message">
        <div class="bubble medium arrow br">
            <div class="contentmes">น้องอุ่นใจ สวัสดีค่ะ</div>
        </div>
    </div>
</div>`;

var modal_chatbot = `
<div class="modal right fade" id="chatbot-wcf" tabindex="-1" role="dialog" aria-labelledby="myModalLabel2">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-body">
                <div class="">
                    <div class="chat-box-header">
                        ChatBot
                        <div class="chat-box-toggle"><svg class="svg-inline--fa fa-times fa-w-11" style="font-size: 18px;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="times" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512" data-fa-i2svg=""><path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg><!-- <i class="fas fa-times" style="font-size:18px;"></i> --></div>
                    </div>
                    <div class="chat-box-body chat-zne">
                        <div class="chat-box-overlay"></div>
                        <div class="chat-logs"></div>
                    </div>
                    <div class="chat-input chat-zne">
                        <form>
                            <input type="text" id="chat-input" placeholder="พิมพ์ข้อความ..." autocomplete="off" />
                            
                            <button type="submit" class="chat-submit" id="chat-submit"><img src="${base_url}/assets/widget/images/ic_sharp-send.png" width="30px"/></button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;

let welcome_sound_str = `
<audio id="welcome_sound" preload="auto" autoplay>
    <source src="${base_url}/assets/widget/music/mix_03s.mp3" />
</audio>`;

let form_ticket = `
<div class="form-ticket" style="display:none">
    <h4>กรุณากรอกข้อมูลเพื่อต้องการสอบถามเพิ่มเติม</h4>
    <form id="form_question_ticket">
        <div class="form-group">
            <label>รายละเอียดคำถามหรือปัญหา</label>
            <select class="form-control" name="masterId">
                
            </select>
        </div>
        <div class="form-group">
            <label>รายละเอียดคำถามหรือปัญหา</label>
            <textarea class="form-control" rows="5" name="question"></textarea>
        </div>
        <div class="form-group">
            <label>ชื่อ-นามสกุล</label>
            <input type="text" class="form-control" name="name" value="">
        </div>
        <div class="form-group">
            <label>เบอร์ติดต่อ</label>
            <input type="text" name="telephone" class="form-control">
        </div>
        <div class="form-group">
            <label for="exampleInputPassword1">Email</label>
            <input type="email" name="email" class="form-control">
        </div>
        <div class="row" style="margin-top: 30px;">
            <div class="col-xs-6"><button type="button" id="close-form-ticket-chatbot" class="btn btn-default btn-block">ยกเลิก</button></div>
            <div class="col-xs-6"><button type="button" id="send-form-ticket-chatbot" class="btn btn-chat-send btn-block">ส่ง</button></div>
        </div>
    </form>
</div>`;

chatboxJq(document).on('click', '.getFormTicket', function () {
    chatboxJq('#chatbot-wcf .chat-zne').hide();
    chatboxJq('#chatbot-wcf .modal-body>div').append(form_ticket);
    chatboxJq('#chatbot-wcf .form-ticket [name="masterId"]').append(option_master_ticket);
    chatboxJq("#chatbot-wcf .form-ticket").fadeIn();

    var access_token = sessionStorage.getItem("access_token");
    var jwt = parseJwt(access_token);

    chatboxJq('#chatbot-wcf .modal-body>div input[name="name"]').val(jwt.name);
});

function removeFormTicket() {
    chatboxJq('#chatbot-wcf .chat-zne').fadeIn();
    chatboxJq('#chatbot-wcf .form-ticket').remove();
}

chatboxJq(document).on('click', '#send-form-ticket-chatbot', function () {
    chatboxJq(this).attr('disabled', 'disabled')
    var formIdName = "#form_question_ticket"
    var formData = chatboxJq(formIdName).serializeArray();
    var postdata = {}
    var validate = true
    formData.forEach(function (elm) {
        if (elm.value == '') {
            validate = false
            chatboxJq(formIdName + ' [name="' + elm.name + '"]').addClass('input-err')
        } else {
            chatboxJq(formIdName + ' [name="' + elm.name + '"]').removeClass('input-err')
        }
        postdata[elm.name] = elm.value
    });

    if (!validate) {
        disabled_send_form_q()
        return false;
    }

    formTicket(postdata, function (result) {
        console.error(result.th);
        removeFormTicket();

    })
});

chatboxJq(document).on('click', '#close-form-ticket-chatbot', function () {
    removeFormTicket();
});

function disabled_send_form_q() {
    chatboxJq('#send-form-ticket-chatbot').removeAttr('disabled');
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}


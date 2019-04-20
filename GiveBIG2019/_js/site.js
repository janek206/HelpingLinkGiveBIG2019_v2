var timeoffset = 0;
function now() {
    return new Date((new Date()).getTime() - timeoffset);
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// media sizing
$(window).on('media-change', function (e) {
    // console.log(e.size);
});

$.fn.fixed = function () {
    $(this).each(function () {
        $(this).data('aspect-ratio', $(this).attr('data-width') / $(this).attr('data-height'));
        console.log($(this).data('aspect-ratio'));
        $(this).on('load', function () {
            console.log('size');
        });
    });
};

var mediaSize = '';
var mediaResize = function () {
    var newSize = '';
    if (window.innerWidth < 500)
        newSize = 'supersmall'
    else if (window.innerWidth < 800)
        newSize = 'small';
    else if (window.innerWidth < 1020)
        newSize = 'medium';
    else
        newSize = 'full';

    if (newSize != mediaSize) {
        mediaSize = newSize;
        $(window).trigger({ type: 'media-change', size: newSize });
    }
};
$(window).resize(mediaResize);
mediaResize();

var isSuperSmall, isSmall, isMedium;

var Cycler = function (items, period, callback) {
    var count = items.length;
    var curIdx = -1;
    var timer;

    var cycle = function () {
        curIdx++;
        curIdx = curIdx % count;
        callback(items[curIdx], curIdx);
        timer = setTimeout(cycle, period);
    };

    return {
        start: function () {
            cycle();
        },
        pause: function() {
            clearTimeout(timer);
        }
    };
};

$.widget('h1.countdown', {
    _create: function () {
        this.$days = this._makecounter('days');
        this.$hours = this._makecounter('hours');
        this.$minutes = this._makecounter('minutes');
        this.$seconds = this._makecounter('seconds');
        this.firstUpdate = true;
        this._update();
    },
    _makecounter: function (unit) {
        var $container = $("<div />")
            .addClass('counter-' + unit)
            .addClass('counter')
            .appendTo($(this.element));

        if (unit != 'days') $container.hide();

        $("<div />")
            .addClass('counter-label')
            .text(unit)
            .appendTo($container);

        return $("<div />")
            .addClass('counter-value')
            .prependTo($container);
    },
    _update: function () {
        var timeLeft = this.options.time - now();

        if (timeLeft < 0) {
            this._trigger('reached', {}, {});
            return;
        }

        var seconds = Math.floor(timeLeft / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        var days = Math.floor(hours / 24);

        seconds = seconds % 60;
        minutes = minutes % 60;
        hours = hours % 24;

        var _this = this;

        if (this.firstUpdate) {
            this.firstUpdate = false;
            $(this.element).animate({ x: 1 }, {
                duration: 1000,
                step: function (val) {
                    // _this._display(days * val, hours * val, minutes * val, seconds * val);
                    var totalHours = hours + days * 24;
                    var totalMinutes = minutes + totalHours * 60;
                    var totalSeconds = seconds + totalMinutes * 60;
                    _this._display(days * val, totalHours * val % 24, totalMinutes * val % 60, totalSeconds * val % 60);
                },
                complete: function () {
                    _this._update();
                }
            });
        } else {
            this._display(days, hours, minutes, seconds);
            setTimeout($.proxy(this._update, this), 1000);
        }
    },
    _display: function (days, hours, minutes, seconds) {
        this.$days.text(this._number(days));
        this.$hours.text(this._number(hours));
        this.$minutes.text(this._number(minutes));
        this.$seconds.text(this._number(seconds));
    },
    _number: function (number) {
        number = number.toFixed(0);
        if (number < 10) return '0' + number;
        return number;
    },
});

$.widget('h1.countup', {
    _create: function () {
        this.firstUpdate = true;
        this._update();
    },
    _update: function () {
        var timeLeft = this.options.time - now();

        console.log(timeLeft);

        if (timeLeft < 0) {
            this._trigger('reached', {}, {});
            this.element.parent().empty();
            return;
        }

        var seconds = Math.floor(timeLeft / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        var days = Math.floor(hours / 24);

        seconds = seconds % 60;
        minutes = minutes % 60;
        hours = hours % 24;

        console.log(seconds);


        var _this = this;

        if (this.firstUpdate) {
            this.firstUpdate = false;
            $(this.element).animate({ x: 1 }, {
                duration: 1000,
                step: function (val) {
                    // _this._display(days * val, hours * val, minutes * val, seconds * val);
                    _this._display(days * val, hours * val, minutes * val, seconds * val);
                },
                complete: function () {
                    _this._update();
                }
            });
        } else {
            this._display(days, hours, minutes, seconds);
            setTimeout($.proxy(this._update, this), 1000);
        }
    },
    _display: function (days, hours, minutes, seconds) {
        // this.$days.text(this._number(days));
        $(this.element).text(this._number(hours, 'hour') + this._number(minutes, 'minute') + this._number(seconds, 'second'));
    },
    _number: function (number, unit) {
        number = number.toFixed(0);
        if (number != 1) unit = unit + 's';
        return number + ' ' + unit + ' ';

    },
});

$.widget('hl.chart', {
    _create: function() {
        // this.element.css({ opacity: 0 });
    },
    reveal: function () {
        if (this.revealed) return;
        this.revealed = true;
        // return;

        // this.element.delay(500).animate({ opacity: 1 });
        var $container = this.element;
        this.element.find(".bar .value").css({ opacity: 0 });
        var width = this.element.width();

        var _this = this;
        _this.element.css({ width: 0 });

        setTimeout(function () {
            _this.element.animate({ width: width });

            _this.element.find(".bar").each(function (idx) {
                var $this = $(this);
                $this.css({ opacity: 0 });
                var delay = 300 + idx * 50;

                var isHighlight = $this.hasClass("highlight");

                if (isHighlight) delay += 0;

                var height = $this.height();
                $this.css({ height: 0, opacity: 1 });
                $this.delay(delay).animate({ height: height, opacity: 1 }, 200);
                $this.find(".value").delay(delay + 100).animate({ opacity: 1 });

                if (isHighlight) {
                    $container.find(".bar").not($this).delay(200).animate({ opacity: 0.5 }, 500);
                }
            });
        }, 300);
    }
});

$.widget('hl.dotabs', {
    _create: function() {
        $(this.element).flextabs();
    },
    reveal: function () {
        if (this.revealed) return;
        this.revealed = true;
        var _this = this;
        var $container = $(this.element).parent();
        $("#do-tabs-content").hide();

        if (mediaSize != 'full') {
            return;
        }

        $(this.element).css({
            left: 300,
            top: 0
        });

        var $doBoxes = $(this.element).find("li a");

        $doBoxes.each(function (idx) {
            var width = $(this).width();
            var height = $(this).height();

            $(this).css({ width: 0, height: 0 });
            $(this).find("span")
                .css({ opacity: 0 })
                .delay(500 + idx * 50)
                .animate( { opacity: 1} );
            $(this).delay(200 + idx * 50).animate({ width: width, height: height });
        });

        var doTabs = $(this.element).children("ul li");
        doTabs.find("a").click(function () {
            doTabsCycler.pause();
        });

        var doTabsCycler = new Cycler(doTabs, 10000, function (curTab, curTabIdx) {
            var next = $(doTabs.get(curTabIdx));
            next.find("a").click();
        });

        $(this.element).delay(1500).animate({ left: 0, top: 0 }, function () {
            doTabsCycler.start();
            $("#do-tabs-content").fadeIn();
            $("#do-tabs-content").css('display', '');
        });
    }
});

$.widget('hl.flextabs', {
    _create: function () {
        var _this = this;

        $(window).on('media-change', function(e) {
            _this._detectSize();
        });

        if (this.options.expando) {
            this.expanded = false;
            $(this.element).find("ul li a").click(function(e) {
                if (_this.expanded) return;
                _this.expanded = true;
                this.$content = $(_this.element).find(".answer");
                this.$content.css({ height: 0, clear: 'both' });
                this.$content.show();
                _this._reapply();
                this.$content.animate({ height: '19em' });
                $(this).click();
                $("body,html").animate({
                    scrollTop:
                        $(this).position().top - ($(window).height() - 510) / 2
                });
                e.preventDefault();
            });
        } else {
            this.expanded = true;
        }

        this._detectSize();
    },
    _detectSize: function() {
        var newSize = '';
        if (mediaSize == 'supersmall' || mediaSize == 'small') {
            newSize = 'mobile';
        } else {
            newSize = 'full';
        }

        if (this.size != newSize) {
            this.size = newSize;
            this._reapply();
        }
    },
    _reapply: function() {
        var _this = this;
        if (this.size == 'full') {

            if (this.mobiled) {
                // remove mobile
                this._trigger('removemobile');
                this.mobiled = false;
                this.$originalmenu.show();
                this.$addedtitles.each(function (i, title) {
                    if (!_this.expanded) {
                        $(title).parent().hide();
                    }
                    $(title).remove();
                });
            }

            this._trigger('applyfull');
            if (this.expanded) {
                this.fulltabbed = true;
                $(this.element).tabs();
            }
        } else {
            if (this.fulltabbed) {
                // remove full
                this._trigger('removefull');
                this.fulltabbed = false;
                $(this.element).tabs('destroy');
            }

            // apply mobile
            this._trigger('applymobile');
            this.mobiled = true;
            this.$originalmenu = $(this.element).children("ul");
            var addedtitles = [];
            this.$originalmenu.find("li a").each(function (i, a) {
                var $content = $($(a).attr('href'));
                $content.show();
                var $title = $("<h3 />")
                    .text($(a).text())
                    .prependTo($content);

                addedtitles.push($title.get(0));
                $content.css({
                    height: 'auto'
                });
            });
            this.$addedtitles = $(addedtitles);
            this.$originalmenu.hide();
        }
    }
});

$.widget("hl.cycler", {
    _create: function () {
        var _this = this;
        this.$items = $(this.element).find("ul li");
        this.$items.hide();

        this.cycler = new Cycler(this.$items, 8000, function (item, idx) {
            _this._showItem(idx);
        });

        this.$cycler = $("<ul />")
            .addClass("cycledots")
            .appendTo(this.element);

        this.cycledots = [];

        this.$items.each(function(idx, item) {
            var dot = $("<li />")
                .text("●")
                .click(function () {
                    _this.cycler.pause();
                    _this._showItem(idx);
                })
                .appendTo(_this.$cycler);

            _this.cycledots[idx] = dot;
        });

        this.previousItemIdx = -1;
        this.cycler.start();
    },
    _showItem: function (idx) {
        if (idx === this.previousItemIdx) return;

        if (this.previousItemIdx >= 0) {
            $(this.$items.get(this.previousItemIdx)).hide();
            this.cycledots[this.previousItemIdx].removeClass("current");
        }
        $(this.$items.get(idx)).show();
        this.cycledots[idx].addClass("current");
        this.previousItemIdx = idx;
    },
});

$(function () {
    $.fn.slideFadeIn = function () {
        if ($(this).css('display') === 'block') {
            $(this).css({'display': 'block', left: '2.5em'});
            return;
        }

        $(this).css({ left: '0em', opacity: 0 });
        $(this).show();
        $(this).animate({ left: '0em', opacity: 1 });
        $(this).css({ 'display': 'block', left: '0em' });
    };

    $.fn.delayShow = function () {
        var $this = $(this);
        $this.css({ opacity: 0});
        var scroll = function (e) {
            var st = $(document).scrollTop();
            var sb = st + $(window).height();

            $this.each(function () {
                var pos = $(this).position();
                pos.bottom = pos.top + $(this).height();

                if (sb > pos.top && pos.top > st ||
                    sb > pos.bottom && pos.bottom > st) {

                    if (!$(this).data('delayShown')) {
                        $(this).animate({ opacity: 1}, 1000);
                        $(this).data('delayShown', true);
                    }
                }
            });
        };

        $(document).on('load', scroll);
        scroll();

        $(document).on('scroll', scroll);
    }

    var _headerCollapsed = false;

    // scroll bar binding for top menu
    $(document).on('scroll', function (e) {
        if (mediaSize != 'full' && mediaSize != 'medium') return;

        var s = $(this).scrollTop();

        var s1 = Math.min(Math.max(s, 0), 100);
        var s2 = Math.min(Math.max(s, 20), 55) - 20;
        var s3 = s2 / 35;

        //     box-shadow:4px 0px 0px rgba(0, 0, 0, 0.5);


        if (s2 > 30 && !_headerCollapsed) {
            $("header").addClass("collapsed");
            _headerCollapsed = true;
        }

        if (s2 < 20 && _headerCollapsed) {
            $("header").removeClass("collapsed");
            _headerCollapsed = false;
        }

    });

    // stories
    $("img.profile").delayShow();

    // count down


    // home page
    $(".spot-text").delay(500).slideFadeIn();

    // do tabs
    var $doTabs = $("#do-tabs").dotabs();
    $("#question-where a").click(function (e) {
        $doTabs.dotabs('reveal');
    });

    // how chart
    var $howChart = $("#how-our-goal-chart").chart();
    $("#question-how a").click(function (e) {
        $howChart.chart('reveal');
    });


    // questions
    $("#questions").flextabs({ expando: true });

    // date reminder
    var datereminders = $(".date-reminder");
    datereminders.find("a.toggle").click(function (e) {
        e.preventDefault();

        var $container = $(this).parent();
        var $reminderMenu = $container.find("ul.reminder-menu");
        var $toggleButton = $(this);

        var $wrapper1 = $("<div />")
            .css({ display: 'inline-block', width: '100%' })
            .insertAfter($toggleButton);

        $toggleButton.appendTo($wrapper1);

        $container.css({
            overflow: 'hidden',
            textOverflow: 'clip',
            whiteSpace: 'nowrap',
            position: 'relative',
            width: $container.width(),
            height: $container.height()
        });

        $reminderMenu.css({
            display: 'inline-block',
        });

        var $closeButton = $("<a href='#' />")
            .text('')
            .addClass('close')
            .insertBefore($reminderMenu);

        $reminderMenu.show();

        $wrapper1.css({});
        $wrapper1.animate({ marginLeft: -$wrapper1.width() });
    });

    // expandos
    var expandos = $(".expando");


    $(".expando.expando-float-right > div").each(function () {
        var parent = $(this).parent();

        $(window).on('resize', function() {
            // de-expand
        });
    });

    expandos.find("a").click(function() {
        var $container = $(this).parent();
        var $content = $container.find("div");

        var $wrapper = $("<div />").css({
            position: 'absolute',
            left: $container.position().left,
            top: $container.position().top,
            overflow: 'hidden',
            zIndex: 1
        }).appendTo($container);

        $content.appendTo($wrapper);
        var paddingTop = $content.css('padding-top');
        var paddingBottom = $content.css('padding-bottom');
        var height = $wrapper.height();
        $wrapper.width($container.width() - $wrapper.outerWidth() + $wrapper.width());
        $wrapper.show();
        $wrapper.css({ height: 0 });
        $wrapper.animate({ height: height });
    });

    // tweets
    $.ajax({
        url: site.apiroot + '/tweets',
    }).done(function(data) {
        var tweets = [];
        tweets = data;
        var $items = $("#social-updates-tweets ul").empty();
        // $("#social-updates-tweets").hide();
        // $("#social-updates").css({ width: 0, visibility: 'visible', opacity: 0 });
        // $("#social-updates").animate({ width: '42.5em', opacity: 1 }, function () {
        // $("#social-updates-tweets").fadeIn();
        // });
        for (var i in tweets) {
            var tweet = tweets[tweets.length - i - 1];
            var $li = $("<li />")
                .html(tweet.html)
                .appendTo($items);

            // $("<a />")
            //    .attr('href', 'https://twitter.com/helpinglink/status/' + tweet.id)
            //    .attr('target', '_blank')
            //    .text(tweet.text)
            //    .appendTo($li);
        }

        $("#social-updates-tweets").cycler();
    });

    // -- social share
    // facebook
    $("a.share-facebook")
        .click(function (e) {
            e.preventDefault();
            window.open($(this).attr('href'), 'Share our story', 'height=400,width=600,status=0,location=no,toolbar=0,left=' + (window.outerWidth / 2 - 300) + ',top=' + (window.outerHeight / 2 - 200));
        });

    // twitter
    $("a.share-twitter")
        .click(function (e) {
            e.preventDefault();
            window.open($(this).attr('href'), 'Share our story', 'height=400,width=600,status=0,location=no,toolbar=0,left=' + (window.outerWidth / 2 - 300) + ',top=' + (window.outerHeight / 2 - 200));
        });

    // video
    var videoexpanded = false;
    $("#video a").click(function (e) {
        e.preventDefault();

        if (videoexpanded) return;
        videoexpanded = true;

        $container = $("#video");
        $("#video img").hide();
        $("#video").css({ textAlign: 'left' });
        var $placeholder = $("<div class='placeholder'></div>")
            .insertBefore("#video img")
            .css({ width: 250, height: 155, opacity: 0 })
            .show();

        var finalWidth = 560;
        var aspect = 560 / 335;
        var containerHeightPadding = 0;
        if (mediaSize != 'full') {
            finalWidth = $container.width();
            containerHeightPadding = 80;
        }

        if (mediaSize == 'supersmall') {
            containerHeightPadding = 100;
        }

        var finalHeight = finalWidth / aspect;

        $placeholder.animate({ width: finalWidth, height: finalHeight, opacity: 1 }, function () {
            $("<iframe width='560' height='335' src='https://www.youtube.com/embed/oAw4JhVV4Q4?autoplay=1' frameborder='0' allowfullscreen></iframe>")
                .appendTo($placeholder);
        });
        $("#video").animate({
            height: finalHeight + 0 + containerHeightPadding});
    });

    // dyn data
    $.ajax({
        url: site.apiroot + '/dyn',
    }).done(function (data) {
        var servertime;
        var servertimeParam = getParameterByName('servertime');
        if (servertimeParam) {
            servertime = servertimeParam;
            $("a").each(function (i, a) {
                $a = $(a);
                var href = $a.attr('href');

                if (href != '#') {
                    if (href.indexOf('?') > -1) {
                        href += '&servertime=' + servertimeParam;
                    } else {
                        href += '?servertime=' + servertimeParam;
                    }
                }

                $a.attr('href', href);
            });
        } else {
            servertime = data.servertime;
        }
        timeoffset = (new Date().getTime()) - Date.parse(servertime);
        var eventStart = new Date('2015-05-05T07:00:00Z');
        var eventEnd = new Date('2015-05-06T07:00:00Z');
        var timeToEvent = eventStart - now();
        console.log('offset', timeoffset, Date.parse(data.servertime));
        console.log('start', timeToEvent);

        var showProgress = function() {
            $("#thankyous").slideDown();
            $("#progress").slideDown();

            $("#progress-timeleft-value")
                .countup({ time: eventEnd });

            var $raised = $("#progress-raised-value");
            var $progressbarfill = $("#progressbar-filled");
            var $progresshead = $("#progressbar-filled-head");
            var progressRatio = ($("#progressbar").width() - 30) / 14000;

            $progressbarfill
                .css({ width: 30, opacity: 1, raised: 0 })
                .delay(200)
                .animate(
                { raised: data.raised },
                {
                    duration: 1000,
                    start: function() {
                    },
                    step: function(raised) {
                        var raised2 = Math.min(raised, 14000);

                        $progressbarfill.width(raised2 * progressRatio + 30);

                        if (raised > 9900) {
                            $progresshead.css({ opacity: (14000 - raised2) / 100 });
                        }

                        $raised.text('$' + Math.round(raised).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                    },
                    complete: function() {
                        // $raised.text('$' + this.raised.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                        // this.step();
                    }
                });

            var $thankyous = $("#thankyous");
            var $thankyouslist = $thankyous.find("ul");

            var cycleOpacity = function(item, init, dir) {
                var end;
                if (dir == -1) end = 0.25;
                else end = 1;

                var toEnd = Math.abs(end - init);

                $item
                    .css({ opacity: init })
                    .animate({ opacity: end }, {
                        duration: toEnd * 1000,
                        complete: function() {
                            cycleOpacity(item, end, dir * -1);
                        }
                    });
            };

            for (var i in data.thankyous) {
                var name = data.thankyous[i];
                var top = Math.random() * 50 - 25;
                var opacity = Math.min(1.0, Math.random() + 0.25);
                var fontSize = Math.random() + 1;
                var $item = $("<li />")
                    .text(name)
                    .appendTo($thankyouslist);

                // cycleOpacity($item, opacity, 1);
            }
        };

        if (timeToEvent > 0) {
            $("#countdown")
                .countdown({ time: eventStart })
                .bind('countdownreached', function() {
                    $("#countdown-container").slideUp();
                    showProgress();
            });
            $("#countdown-container").slideDown();
            return;
        } else {
            showProgress();
        }

    });

    if (getParameterByName('kiosk') == '1') {
        setTimeout(function () {
            location.reload();
        }, 1000 * 60);
    }

    // debug
    // $("#question-how a").click();
});
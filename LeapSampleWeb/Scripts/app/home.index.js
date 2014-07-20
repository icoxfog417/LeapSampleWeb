function HomeIndex() {
    var self = this;
    Parse.initialize(SECRET_KEY.APP_ID, SECRET_KEY.CLIENT_KEY);

    self.timestamp = START_TIMESTAMP;
    self.circles = ko.observableArray([]);
    self.slides = ko.observableArray([
        "/Content/images/hill_fence.jpg",
        "/Content/images/houses.jpg",
        "/Content/images/lavender.jpg",
        "/Content/images/nature-centre.jpg",
        "/Content/images/sandhill.jpg",
        "/Content/images/tree_root.jpg",
        "/Content/images/white_dish.jpg"
    ]);

    self.direction = true;
    self.progressDiff = 0;
    self.$slider = null;
    self.slideIndex = 0;

    self.makeSlide = function () {
        if ($("#bx-pager img").size() == self.slides().length) {
            if (self.$slider == null) {
                self.$slider = $('.bxslider').bxSlider({
                    pagerCustom: '#bx-pager'
                });
            }
        }
    }

    self.calculateSlideIndex = function (c) {
        /*
        if (self.direction != c.get("Direction") || c.get("State") != 0) {
            self.progressDiff = 0;
        }

        self.direction = c.get("Direction");
        self.progressDiff = self.progressDiff + (self.direction ? 1 : -1) * Math.floor(c.get("Progress"));
        self.slideIndex += self.progressDiff;
        */
        self.slideIndex += (c.get("Direction") ? 1 : -1);

        if (self.slideIndex >= self.slides().length) {
            self.slideIndex -= self.slides().length;
        } else if (self.slideIndex < 0) {
            self.slideIndex += self.slides().length;
        }

    }


    self.receiveCircle = function () {
        var Circle = Parse.Object.extend("Circle");
        var query = new Parse.Query(Circle);
        query.ascending("LoggedAt");
        query.greaterThan("LoggedAt", self.timestamp);
        query.find().then(function (results) {
            if (results.length > 0) {
                r = results[Math.floor(results.length / 2)];

                if (r.get("Progress") >= 1.0 && r.get("Progress") <= 1.5) {
                    self.calculateSlideIndex(r);
                    self.$slider.goToSlide(self.slideIndex);
                    self.circles.push({ "slideIndex": self.slideIndex });
                    //if get gesture, set a little long interval to avoid duplicate detection.
                }
                self.timestamp = results[results.length - 1].get("LoggedAt");
            }
            setTimeout(function () {
                self.receiveCircle();
            }, 500);
        })
    };

}
app = new HomeIndex();
setTimeout(function () {
    app.makeSlide();
}, 10);
app.receiveCircle();


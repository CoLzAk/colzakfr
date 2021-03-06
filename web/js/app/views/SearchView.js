App.module("SearchModule", function(SearchModule, App, Backbone, Marionette, $, _){

    SearchMenuView = Backbone.Marionette.ItemView.extend({
        template: '#clzk-search-menu-template',
        bindings: {
            '#filter-radius-value': {
                observe: 'params.radius',
                onGet: function(value) {
                    return Math.round(value) || 20;
                },
                onSet: function(value) {
                    return Math.round(value);
                }
            },
            '#filter-gender': 'params.gender',
            '#filter-age': 'params.age',
            '#filter-category': 'params.category',
            '#filter-experience': 'params.experience'
        },
        events: {
            'change .search-filter': 'updateResults',
            'click .search-switch': 'changeDirection'
        },
        changeDirection: function(e) {
            e.preventDefault();
            var direction = $(e.currentTarget).data('direction'),
                params = this.model.queryUrl.searchParams,
                paramsToRemove = ['gender', 'age', 'category', 'experience'];

            this.model.queryUrl.direction = direction;
            // this.model.queryUrl.searchParams['page'] = 1;

            for (var param in params) {
                if (paramsToRemove.indexOf(param) > -1) {
                    delete params[param];
                }
            }
            Backbone.history.navigate(this.objectToUrl(this.model.queryUrl), { trigger: true });
        },
        updateResults: function(e) {
            var value = $(e.currentTarget).val();
            e.preventDefault();
            if ($(e.currentTarget).attr('type') == 'checkbox') {
                value = $(e.currentTarget).is(':checked');
            }
            if (value !== '' && value.length !== 0 && value !== false) {
                this.model.queryUrl.searchParams[$(e.currentTarget).attr('data-filter')] = value;

            } else {
                delete this.model.queryUrl.searchParams[$(e.currentTarget).attr('data-filter')];
            }

            Backbone.history.navigate(this.objectToUrl(this.model.queryUrl), { trigger: true });
        },
        objectToUrl: function(queryUrl) {
            var url = queryUrl.localization + '/' + queryUrl.direction;
            var i = 0;
            for (var param in queryUrl.searchParams) {
                // if (param != 'lat' && param != 'lng' && param != 'page') {
                if (param != 'lat' && param != 'lng') {
                    if (i === 0) url += '?';
                    url += param + '=' + queryUrl.searchParams[param] + '&';
                    i++;
                }
            }
            if (url.slice(-1) == '&') url = url.substring(0, url.length - 1);
            return url;
        },
        onDomRefresh: function() {
            var categories = (typeof this.model.get('params').category !== 'undefined' ? this.model.get('params').category.split(',') : []);

            if (this.model.queryUrl.direction == 'profiles') {
                $('.profile-filter').show();
                $('#events-direction').removeClass('btn-primary disabled').addClass('btn-default');
                $('#profiles-direction').addClass('btn-primary disabled');
            }

            if (this.model.queryUrl.direction == 'events') {
                $('.profile-filter').hide();
                $('#profiles-direction').removeClass('btn-primary disabled').addClass('btn-default');
                $('#events-direction').addClass('btn-primary disabled');
            }

            this.initMap();
            $('#filter-radius').noUiSlider({
                start: [ this.model.get('params').radius || 20 ],
                connect: 'lower',
                step: 1,
                range: {
                    'min': 1,
                    'max': 20
                },
                serialization: {
                    lower: [
                        $.Link({
                            target: $("#filter-radius-value")
                        })
                    ],
                    format: {
                        decimals: 0
                    }
                }
            });
            for (var i in categories) {
                $('#' + categories[i] + '-category').prop('checked', true);
            }

            //Click on the instruments family
            $('.filter-category').click(function(e) {
                var filterCategories = $('#filter-category'),
                    category = '';
                if (e.currentTarget.checked === true) {
                    if (filterCategories.val().length > 0) category += ',';
                    category += $(e.currentTarget).data('category');
                    filterCategories.val(filterCategories.val() + category);
                } else {
                    filterCategories.val(filterCategories.val().replace($(e.currentTarget).data('category'), ''));
                    while (filterCategories.val().slice(-1) == ',') {
                        filterCategories.val(filterCategories.val().substring(0, filterCategories.val().length - 1));
                    }
                    while (filterCategories.val().charAt(0) == ',') {
                        filterCategories.val(filterCategories.val().substring(1));
                    }
                }
                filterCategories.trigger('change');
            });
        },
        initMap: function() {
            var markers = '';
            var mapWidth = ($('#map').width() > 0 ? $('#map').width() : 200);
            var mapUrl = '';
            var zoom = 11;

            if (typeof this.model.get('params').radius !== 'undefined') {
                if (this.model.get('params').radius < 8) zoom = 12;
                if (this.model.get('params').radius < 5) zoom = 13;
                if (this.model.get('params').radius <= 1) zoom = 14;
            }

            if (this.model.get('params').direction == 'profiles') {
                var profiles = this.model.get('items');
                for (var i in profiles) {
                    if (typeof profiles[i].coordinates.y !== 'undefined' || profiles[i].coordinates.y !== null && typeof profiles[i].coordinates.x !== 'undefined' || profiles[i].coordinates.x !== null) {
                        markers += '&markers=color:red|' + profiles[i].coordinates.y + ',' + profiles[i].coordinates.x;
                    }
                }
            }
            if (this.model.get('params').direction == 'events') {
                var userEvents = this.model.get('items');
                for (var i in userEvents) {
                    if (typeof userEvents[i].event_coordinates.y !== 'undefined' || userEvents[i].event_coordinates.y !== null && typeof userEvents[i].event_coordinates.x !== 'undefined' || userEvents[i].event_coordinates.x !== null) {
                        markers += '&markers=color:red|' + userEvents[i].event_coordinates.y + ',' + userEvents[i].event_coordinates.x;
                    }
                }
            }
            mapUrl = 'http://maps.googleapis.com/maps/api/staticmap?key=AIzaSyB3nP1qZvWfWiDArNPaAdoo5nM_L9iJQgY&center='+ this.model.queryUrl.searchParams['lat'] +','+ this.model.queryUrl.searchParams['lng'] +'&zoom='+ zoom +'&size='+mapWidth+'x180&maptype=roadmap&sensor=false' + markers;
            $('#map').html('<img src="'+ mapUrl +'">');

            //Dynamic map

            // var map = new google.maps.Map(document.getElementById('map'));
            // //  Make an array of the LatLng's of the markers you want to show
            // var LatLngList = new Array(new google.maps.LatLng (52.537,-2.061), new google.maps.LatLng (52.564,-2.017));
            // //  Create a new viewpoint bound
            // var bounds = new google.maps.LatLngBounds();
            // //  Go through each...
            // for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
            //   //  And increase the bounds to take this point
            //   bounds.extend(LatLngList[i]);
            // }
            // //  Fit these bounds to the map
            // map.fitBounds(bounds);
        },
        onRender: function() {
            this.stickit();
        }
    });

    SearchPaginationView = Backbone.Marionette.ItemView.extend({
        template: '#clzk-search-pagination-template',
        events: {
            'click .paginator-page': 'paginate'
        },
        paginate: function(e) {
            e.preventDefault();
            this.model.queryUrl.searchParams['page'] = parseInt($(e.currentTarget).data('page'));
            Backbone.history.navigate(this.objectToUrl(this.model.queryUrl), { trigger: true });
        },
        serializeData: function() {
            var currentPage = parseInt(this.model.get('current_page_number'), 10),
                totalPages = Math.round(parseInt(this.model.get('total_count'), 10) / parseInt(this.model.get('num_items_per_page'), 10)),
                previousPage = (currentPage > 1 ? currentPage - 1 : null),
                nextPage = (currentPage < totalPages ? currentPage + 1 : null );

            return {
                currentPage: currentPage,
                totalPages: totalPages,
                previousPage: previousPage,
                nextPage: nextPage,
                results: this.model.toJSON()
            };
        },
        objectToUrl: function(queryUrl) {
            var url = queryUrl.localization + '/' + queryUrl.direction;
            var i = 0;
            for (var param in queryUrl.searchParams) {
                if (param != 'lat' && param != 'lng') {
                    if (i === 0) url += '?';
                    url += param + '=' + queryUrl.searchParams[param] + '&';
                    i++;
                }
            }
            if (url.slice(-1) == '&') url = url.substring(0, url.length - 1);
            return url;
        }
    });

    SearchResultView = Backbone.Marionette.ItemView.extend({
        template: '#clzk-search-result-template',
        tagName: 'div',
        events: {
            'click .clzk-search-profile-container': 'showProfilePreview',
            'click .follow-button': 'toggleFollowUser'
        },
        showProfilePreview: function(e) {
            e.preventDefault();
            window.location.replace(Routing.generate('colzak_user_homepage', { 'username': this.model.get('username') }));
            return;
            NProgress.start();
            $('.clzk-results-number-container').addClass('hidden');
            $('.clzk-search-profile-container').addClass('hidden');
            $('.clzk-search-info-container').addClass('hidden');
            $('.pagination-container').addClass('hidden');
            $(e.currentTarget).removeClass('hidden').addClass('rendering');
            $('#share-profile-'+this.model.get('id')).removeClass('hidden');
            $('#clzk-result-actions-container-'+this.model.get('id')).removeClass('hidden');
            Backbone.history.navigate(SearchModule.queryUrl.localization+'/'+SearchModule.queryUrl.direction+'/preview/'+this.model.get('id'), { trigger: true });
        },
        serializeData: function() {
            var profile_picture = this.model.get('profile_photo');

            return {
                profile_picture_path: (typeof profile_picture !== 'undefined' ? profile_picture.thumb_path : undefined),
                profile: this.model.toJSON(),
                nbInstrumentsToDisplay: (SearchModule.isMobile ? 2 : 3),
                isFollowing: (typeof this.isFollowing() === 'undefined' ? false : true),
                isMobile: SearchModule.isMobile,
                isHimself: (SearchModule.authUser !== null ? SearchModule.authUser.profile.id === this.model.get('id') : false),
                isAuthenticated: SearchModule.authUser
            };
        },
        toggleFollowUser: function(e) {
            e.preventDefault();
            NProgress.start();
            var that = this;
            if (SearchModule.authUser === null || SearchModule.authUser == '') {
                window.location.replace(Routing.generate('fos_user_security_login'));
                return;
            }
            $.ajax({
                url: (typeof that.isFollowing() === 'undefined' ? Routing.generate('users_follow_user', { profileId: that.model.get('id') }) : Routing.generate('users_unfollow_user', { profileId: that.model.get('id') })),
                type: (typeof that.isFollowing() === 'undefined' ? 'POST' : 'DELETE'),
                dataType: 'json',
                success: function(data) {
                    if (that.isFollowing()) { 
                        SearchModule.authUser.profile.following.splice(SearchModule.authUser.profile.following.indexOf(that.isFollowing()), 1);
                        $('.follow-button').removeClass('text-danger').html('<span class="glyphicon glyphicon-ok"></span>&nbsp;&nbsp;Suivre ce musicien');
                    } else { 
                        SearchModule.authUser.profile.following.push(data);
                        $('.follow-button').addClass('text-danger').html('<span class="glyphicon glyphicon-remove"></span>&nbsp;&nbsp;Ne plus suivre');
                    }
                    //that.render();
                    NProgress.done();
                },
                error: function(data) {
                    NProgress.done();
                    // console.log(data);
                }
            });
        },
        isFollowing: function() {
            if (SearchModule.authUser === null || SearchModule.authUser == '') {
                return;
            }
            return _.findWhere(SearchModule.authUser.profile.following, { username: this.model.get('username') });
        },
        onDomRefresh: function() {
            // var that = this;
            // $('.clzk-search-profile-container').on('click', function(e) {
            //     e.preventDefault();
            //     window.location.href = Routing.generate('colzak_user_homepage', { username: that.model.get('username') });
            // });
        }
    });

    SearchResultEmptyView = Backbone.Marionette.ItemView.extend({
        template: '#clzk-search-result-empty-template'
    });

    SearchResultsView = Backbone.Marionette.CompositeView.extend({
        template: '#clzk-search-results-template',
        itemView: SearchResultView,
        emptyView: SearchResultEmptyView,
        itemViewContainer: '#clzk-search-result-container',
        serializeData: function() {
            return {
                results: this.collection.toJSON()
            };
        }
    });

    SearchEventView = Backbone.Marionette.ItemView.extend({
        template: '#clzk-search-event-template',
        tagName: 'div',
        className: 'bg-dark mb1',
        events: {
            'click .event-container': 'showEventPreview'
        },
        showEventPreview: function(e) {
            e.preventDefault();
            window.location.replace(Routing.generate('colzak_event', { 'eventId': this.model.get('id') }));
            return;
            NProgress.start();
            $('.clzk-results-number-container').addClass('hidden');
            $('.share-action-button-container').addClass('hidden');
            $('.event-container').addClass('hidden');
            $('.pagination-container').addClass('hidden');
            $('.clzk-search-info-container').addClass('hidden');
            $(e.currentTarget).removeClass('hidden').addClass('rendering');
            $('#share-event-'+this.model.get('id')).removeClass('hidden');
            $('#clzk-result-actions-container-'+this.model.get('id')).removeClass('hidden');

            Backbone.history.navigate(SearchModule.queryUrl.localization+'/'+SearchModule.queryUrl.direction+'/preview/'+this.model.get('id'), { trigger: true });
        },
        serializeData: function() {
            var completeAddress = '',
                isHimself = false;

            if (this.isAuthenticated) {
                if (SearchModule.authUser.profile.id === this.model.get('profile').id) {
                    isHimself = true;
                }
            }

            if (this.model.get('street_number') !== '') completeAddress += this.model.get('street_number') + ' ';
            if (this.model.get('route') !== '') completeAddress += this.model.get('route') + ', ';
            if (this.model.get('sublocality') !== '') completeAddress += this.model.get('sublocality') + ', ';
            if (this.model.get('locality') !== '') completeAddress += this.model.get('locality') + ', ';
            if (this.model.get('country') !== '') completeAddress += this.model.get('country');
            return {
                userEvent: this.model.toJSON(),
                completeAddress: completeAddress,
                isParticipating: this.isParticipating,
                isAuthenticated: this.isAuthenticated,
                isHimself: isHimself
            };
        },
        onDomRefresh: function() {
            var that = this;
            $('#share-event-'+this.model.get('id')).on('click', function(e) {
                e.preventDefault();
                // console.log('share it my friend');
            });
        },
        initialize: function() {
            this.isParticipating = false;
            this.isAuthenticated = false;
            if (SearchModule.authUser !== null) this.isAuthenticated = true;
            var participants = this.model.get('participants');

            if (this.isAuthenticated) {
                for (var i in participants) {
                    if (participants[i].id === SearchModule.authUser.profile.id) {
                        this.participationIndex = i;
                        this.isParticipating = true;
                        break;
                    }
                }
            }
        },
    });

    SearchEventEmptyView = Backbone.Marionette.ItemView.extend({
        template: '#clzk-search-event-empty-template'
    });

    SearchEventsView = Backbone.Marionette.CompositeView.extend({
        template: '#clzk-search-events-template',
        itemView: SearchEventView,
        emptyView: SearchEventEmptyView,
        itemViewContainer: '#clzk-search-event-container',
        serializeData: function() {
            return {
                results: this.collection.toJSON()
            };
        }
    });

    SearchEventPreviewView = Backbone.Marionette.ItemView.extend({
        template: '#clzk-search-event-preview-template',
        events: {
            'click .participate-button': 'toggleParticipate',
            'click .back-to-results': 'navigateBack'
        },
        navigateBack: function(e) {
            e.preventDefault();
            NProgress.start();
            window.history.back();
        },
        toggleParticipate: function(e) {
            if (typeof SearchModule.authUser === 'undefined' || SearchModule.authUser.id === null || SearchModule.authUser.id == '') {
                window.location.replace(Routing.generate('colzak_static_homepage'));
                return;
            }
            var that = this;
            NProgress.start();
            e.preventDefault();
            $.ajax(Routing.generate('events_post_events_user_participate', { id: this.model.get('id'), userId: SearchModule.authUser.id }), {
                type: "POST",
                dataType: 'json',
                success: function(data) {
                    if (!that.isParticipating) {
                        that.model.get('participants').push(SearchModule.authUser.profile);
                        that.isParticipating = true;
                    } else {
                        delete that.model.get('participants')[that.participationIndex];
                        that.isParticipating = false;
                    }
                    NProgress.done();
                    that.render();
                },
                error: function (xhr) {
                    // console.log(xhr);
                }
            });
        },
        onDomRefresh: function() {
            NProgress.done();
            this.initMap();
        },
        serializeData: function() {
            var completeAddress = '',
                isHimself = false;

            if (this.isAuthenticated) {
                if (SearchModule.authUser.profile.id === this.model.get('profile').id) {
                    isHimself = true;
                }
            }

            if (this.model.get('street_number') !== '') completeAddress += this.model.get('street_number') + ' ';
            if (this.model.get('route') !== '') completeAddress += this.model.get('route') + ', ';
            if (this.model.get('sublocality') !== '') completeAddress += this.model.get('sublocality') + ', ';
            if (this.model.get('locality') !== '') completeAddress += this.model.get('locality') + ', ';
            if (this.model.get('country') !== '') completeAddress += this.model.get('country');
            return {
                userEvent: this.model.toJSON(),
                completeAddress: completeAddress,
                isParticipating: this.isParticipating,
                isAuthenticated: this.isAuthenticated,
                isHimself: isHimself
            };
        },
        initialize: function() {
            this.isParticipating = false;
            this.isAuthenticated = false;
            if (SearchModule.authUser !== null) this.isAuthenticated = true;
            var participants = this.model.get('participants');

            if (this.isAuthenticated) {
                for (var i in participants) {
                    if (participants[i].id === SearchModule.authUser.profile.id) {
                        this.participationIndex = i;
                        this.isParticipating = true;
                        break;
                    }
                }
            }
        },
        initMap: function() {
            var mapWidth = $('.preview-map-container').width();
            var mapUrl = '';
            var zoom = 16;

            mapUrl = 'http://maps.googleapis.com/maps/api/staticmap?key=AIzaSyB3nP1qZvWfWiDArNPaAdoo5nM_L9iJQgY&center='+ this.model.get('event_coordinates').y +','+ this.model.get('event_coordinates').x +'&zoom='+ zoom +'&size='+ mapWidth +'x180&maptype=roadmap&sensor=false&markers=color:red|' + this.model.get('event_coordinates').y + ',' + this.model.get('event_coordinates').x;
            $('#event-preview-map').html('<img src="'+ mapUrl +'">');
        }
    });

    SearchProfilePreviewView = Backbone.Marionette.ItemView.extend({
        template: '#clzk-search-profile-preview-template',
        events: {
            'click #send-message-button': 'sendMessage',
            'click .back-to-results': 'navigateBack'
        },
        navigateBack: function(e) {
            e.preventDefault();
            NProgress.start();
            window.history.back();
        },
        sendMessage: function(e) {
            e.preventDefault();
            NProgress.start();
            var messageContent = $('#message-content').val();
            var message = new Message({ message: messageContent }, { recipientId: this.model.get('id') });

            message.save({}, {
                success: function(response, model) {
                    $('#message-content').val('');
                    $('.message-sign').removeClass().addClass('message-sign glyphicon glyphicon-ok-sign');
                    $('.message-text').html('Votre message a bien été envoyé !')
                    $('.clzk-flash-messages-container').removeClass().addClass('clzk-flash-messages-container alert alert-success');
                    $('.clzk-flash-messages-container').fadeIn( 400 ).delay( 3000 ).fadeOut( 400 );
                    NProgress.done();
                },
                error: function(response) {
                    $('.message-sign').removeClass().addClass('message-sign glyphicon glyphicon-remove-sign');
                    $('.message-text').html('Une erreur est survenue. Veuillez réesayer ultérieurement ou contacter le support')
                    $('.clzk-flash-messages-container').removeClass().addClass('clzk-flash-messages-container alert alert-danger');
                    $('.clzk-flash-messages-container').fadeIn( 400 ).delay( 3000 ).fadeOut( 400 );
                    NProgress.done();
                }
            });
        },
        onDomRefresh: function() {
            NProgress.done();
        },
        serializeData: function() {
            var isAuthenticated = (SearchModule.authUser !== null),
                isHimself = (isAuthenticated ? SearchModule.authUser.profile.id === this.model.get('id') : false);
            return {
                profile: this.model.toJSON(),
                isAuthenticated: isAuthenticated,
                isHimself: isHimself
            };
        }
    });
});
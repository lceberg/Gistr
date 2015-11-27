;(function() {

	Vue.http.headers.common['X-CSRF-TOKEN'] = document.querySelector('#csrf_token').getAttribute('value');

	new Vue({

		el: '#gistr',

		data: {
			gists_data  : {},
			search      : '',
			loading     : true,
			favorites   : false,
			currentPage : 1,
			maxPages    : 1
		},

		computed: {
			showSearch: function() {
				var displaySearch = true;

				if ( this.maxPages < 1 ) {
					displaySearch = false;
				}

				if ( this.search !== '' && this.search !== ' ' ) {
					displaySearch = false;
				}

				if ( this.favorites ) {
					displaySearch = false;
				}

				return displaySearch;
			}
		},

		ready: function() {
			this.fetchGists();
		},

		methods: {
			fetchGists: function( fetch ) {
				this.loading = true;

				this.$http.get( '/gists', function ( data ) {

					var gistIndex = 1;

					for ( var gist in data ) {
						
						if ( gistIndex > 10 ) {
							this.maxPages++;
							gistIndex = 1;
						}

						data[gist].page = this.maxPages;

						gistIndex++;
					}

					this.gists_data = data;
					this.loading    = false;

					setTimeout(function() {
						jQuery('code[data-gist-id]').gist();
					}, 0);
				} );
			},

			updateGists: function( fetch ) {
				this.$http.post( '/gists', { gists: this.gists_data }, function(data) {

				}, {
					emulateJSON: true
				} );
			},

			setPage: function( page ) {
				this.currentPage = page;
			},

			toggleFavorites: function() {
				this.favorites = ! this.favorites;
			},

			toggleCode: function(gist) {
				gist.expanded = ( gist.expanded == 1 ) ? 0 : 1;
			},

			favoriteGist: function(gist) {
				gist.favorited = ( gist.favorited == 1 ) ? 0 : 1;
				this.updateGists();
			},

			gistName: function(gist) {
				var gistName = gist.name;

				if ( this.search !== '' && this.search !== ' ' ) {
					var searchQuery  = this.search.trim();
					var searchRegExp = new RegExp( '(' + searchQuery + ')', 'gi' );
					
					gistName = gistName.replace( searchRegExp, '<strong>$1</strong>' );
				}

				return gistName;
			},

			gistHidden: function(gist) {
				var gistClass = '';
				var gistName  = gist.name;

				if ( this.search !== '' && this.search !== ' ' ) {
					var searchQuery = this.search.trim();
					var isMatching  = gistName.match( new RegExp( searchQuery, 'gi' ) );

					if ( ! isMatching ) {
						gistClass = 'gist-hidden';
					}
				}

				if ( this.favorites && gist.favorited == 0 ) {
					gistClass = 'gist-hidden';
				}

				if ( ( this.search === '' || this.search === ' ' ) && ! this.favorites ) {
					if ( this.currentPage !== gist.page ) {
						gistClass = 'gist-hidden';
					}
				}

				return gistClass;
			}
		}
	});

})();
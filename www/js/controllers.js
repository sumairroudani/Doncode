angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $timeout, $window, $ionicSlideBoxDelegate, dataFactory) {

	$scope.$on('$locationChangeStart', function(next, current) { 
		active    = document.querySelector('.__navtabs .active');
		activated = document.querySelector('.__navtabs .activated');
			if(active && activated){
			    active.classList.remove('active')
				activated.classList.add('active')
			}
	});

	$scope.updateSession();
	$scope.data = {}
	$scope.asyncCount = function(){
		
		dataFactory._loading(true);
		dataFactory.service('POST','http://app.octantapp.com/api/message_count',{donor_id:App_Session.donor_id}).
		then(function(res){
			console.log(res.data);
			$scope.data.unread = {msgs:res.data.msg,feed:res.data.feed,events:res.data.events}
		}).
		finally(function(){
			dataFactory._loading(false);
		})

	}
	$scope.asyncCount();

	$scope.logout = function(){
		did = API.storage.get("donorId");
		$scope.destroySess(did,true);
		dataFactory._go('login');
	}

	ionic.DomUtil.ready(function(){
		active = document.querySelector('active');
		activated = document.querySelector('activated');
	})

	$scope.datify = function(dt,param){
		date = new Date(dt);
		// str = date.toISOString().slice(0, 19).replace('T', ' ')
		switch(param){
			case 'date':
				return date.toLocaleDateString();
				break;
			case 'time':
				return date.toLocaleTimeString();
				break;
			default:
				return date.toLocaleString();
				break;
		}
	}

	$ionicSlideBoxDelegate.update();
	$scope.next = function() {
		$ionicSlideBoxDelegate.next();
		$rootScope.$broadcast("slideChange");
	};
	$scope.previous = function() {
		$ionicSlideBoxDelegate.previous();
		$rootScope.$broadcast("slideChange");
	};
	
})

.controller('FeedsController', function($scope, dataFactory) {
	$scope.asyncCount();
	$scope.updateProf();

	$scope.lala = true;
	$scope.readme = false;
	$scope.feeds = API.storage.get("feeds_"+App_Session.donor_id);
	var donid = App_Session.donor_id;

	dataFactory.service("POST","http://app.octantapp.com/api/msg_feeds",{'donor_id':donid}).
		success(function(data, textStatus, xhr){
			var feeder = {};
			var x = data.feed_id;
			for(i in x){
				if(x[i].pic == ""){
					x[i].pic = null;
				}
				lii = x[i].content
				x[i].contentPrev = x[i].content.slice(0,100);
				x[i].link_id = i;
				x[i].acro = (x[i].msg_type_id == 2) ? "event" : "feed" ;
				feeder[i] = x[i];
			}
			$scope.feeds = feeder;
			API.storage.set("feeds_"+App_Session.donor_id,feeder);
			locale = $scope.feeds;

		}).
		error(function() {
			console.log("NO INTERNET");
			// dataFactory._alert("");
			$scope.feeds = API.storage.get("feeds_"+App_Session.donor_id);
			locale = $scope.feeds;
		});

	$scope.isreadchk = function(message_id,link){
		$scope.feeds[link].is_read = true;
		if(message_id!=false){
			dataFactory.service('POST','http://app.octantapp.com/api/message_read/123456789',{'msg_id':message_id, 'donor_id':donid}).
				success(function(data, textStatus, xhr) {
					console.log(data);
				}).
				error(function(data, textStatus, xhr) {
					console.log(data);
				});			
		}
	}

	$scope.donatetoorg = function(orgid){
		dataFactory._go('app.donate',{'orgid':orgid})
	}

	$scope.platforms = function(id){
		CS = "";
		switch(id){
			case 1:
				CS = "ion\-ionic organizaionsC";
				break;
			case 2:
				CS = "ion\-ionic eventsC";
				break;
			case 3:
				CS = "ion\-social\-facebook";
				break;
			case 4:
				CS = "ion\-social\-twitter";
				break;
			case 5:
				CS = "ion\-ionic msgs";
				break;
			default:
				break;
		}
		return CS;
	}

})

.controller('FeedController', function($scope, $stateParams, dataFactory) {
	//alert($stateParams.feedid);

	var msgid = $stateParams.message_id;
	var index = $stateParams.index;
	var donid = App_Session.donor_id;
	$scope.feed = null;
	var AllFeeds = API.storage.get("feeds_"+App_Session.donor_id);

	if(AllFeeds[index]||AllFeeds[index]!=undefined){
		$scope.feed = AllFeeds[index];
		$scope.feed.is_read = true;
		console.log("foundFeed:",$scope.feed)
		dataFactory.service('POST','http://app.octantapp.com/api/message_read/123456789',{'msg_id':msgid, 'donor_id':donid}).
			success(function(data, textStatus, xhr) {
				console.log(data);
			}).
			error(function(data, textStatus, xhr) {
				console.log(data);
			});
	}
	else{
		console.log(msgid,"Not Found");
	}
	// console.log("foundAllFeeds:",$scope.feed,"need",$stateParams.message_id)

	$scope.asyncCount();
})

.controller('EventController', function($scope, $stateParams, dataFactory) {
	//alert($stateParams.feedid);

	var msgid = $stateParams.message_id;
	var index = $stateParams.index;
	var donid = App_Session.donor_id;
	$scope.feed = null;
	var AllFeeds = API.storage.get("event_"+App_Session.donor_id);

	if(AllFeeds[index]||AllFeeds[index]!=undefined){
		$scope.feed = AllFeeds[index];
		$scope.feed.is_read = true;
		dataFactory.service('POST','http://app.octantapp.com/api/message_read/123456789',{'msg_id':msgid, 'donor_id':donid}).
			success(function(data, textStatus, xhr) {
		console.log("foundFeed:",$scope.feed)
				console.log('singlePost:',data);
			}).
			error(function(data, textStatus, xhr) {
				console.log(data);
			});
	}
	else{
		console.log(msgid,"Not Found");
	}
	// console.log("foundAllFeeds:",$scope.feed,"need",$stateParams.message_id)

	$scope.asyncCount();
})

.controller('ProfileController', function($scope,dataFactory,$ionicPopup,md5,$timeout) {

	$scope.updateProf();
	console.log()

	dataFactory._loading(true,'Fetching Profile');
	dataFactory.sec_question().then(function(res){
		$scope.questions = res.data.feed_id;
		console.log($scope.questions);
	}).
	finally(function(){dataFactory._loading(false);})

	// $scope.image64 = null;
	$scope.image = {
		img64: null,
		img: null
	}
	$scope.pass = {
		pass_1 : null,
		pass_2 : null,
		oldPass: null
	}

	donid = App_Session.donor_id;

	$timeout(function(){
		$scope.profile = API.storage.get('userProf');	
		profchk = $scope.profile;
		$scope.pass.oldPass = $scope.profile.password;
		console.log($scope.pass.oldPass);
		if($scope.profile.image)
			$scope.image.img64 = $scope.profile.image;
	}, 1000);
	


	$scope.updateUser = function(){

		if($scope.image && $scope.image.img64 && $scope.image.img){
			console.log()
			$scope.profile.image = $scope.image.img64;
			if((parseInt($scope.image.img.filesize)/1024) > 1024){
				dataFactory._alert("Image Size too big","Image Size bigger than 1 mb");
				return;
			}			
		}
		console.log($scope.newuser)

		var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		var rep = /^[a-zA-Z0-9]{8,20}$/
		if(!re.test($scope.profile.email)){
			console.log('wut',re.test($scope.profile.email),$scope.profile.email)
			dataFactory._alert("Incomplete Form","Invalid Email");
			return;
		}

		if($scope.pass.pass_1!=null){
			console.log("pass Exisits");
			if($scope.pass.pass_2!=null){
				if(!rep.test($scope.pass.pass_2)){
					dataFactory._alert("Incomplete Form","Your password must be between 8 and 20 characters");
					return;
				}
				if($scope.pass.pass_1 === $scope.pass.pass_2){
					var newpass = md5.createHash($scope.pass.pass_2 || '');
					$scope.profile.password = newpass;
				}
				else{
					dataFactory._alert("Incorrect Password", "The Password you entered do not match");
					return;
				}
			}
			else{
				dataFactory._alert("Incorrect Password","Re-Enter Password Please!");
				return;
			}
		}
		else{
			
		}

		if($scope.profile.sec_answer)
			if(!($scope.profile.sec_answer.length>8)){
				dataFactory._alert('Security Answer','Security Answer too short, Please enter more than 8 characters')
				return
			}
		dataFactory._loading(true,"Updating Profile");
		dataFactory.service('PUT','http://app.octantapp.com/api/donor',$scope.profile).
			success(function (data, status, headers, config) {
				if(data.Error && data.Message.code == "ER_DUP_ENTRY"){
					dataFactory._alert("Error","Duplicate Email Found")
					return;
				}

				console.log(data,$scope.profile);
				dataFactory._alert('Data Updated','Your new data has been updated');
				API.storage.set('donorId',$scope.profile.donor_id);
				API.storage.set('donorName',$scope.profile.first_name+" "+$scope.profile.last_name);
				API.storage.set('donorImage',$scope.profile.image);
				$scope.updateSession();
			}).
			error(function (data, status, headers, config) {
					console.log('error',data,status);
			}).finally(function(){
				$scope.updateProf();
				dataFactory._loading(false);
			});
	}


	$scope.swapimage = function(obj){
		console.log($scope.image);
		$scope.image.img64 = 'data:image/jpg;base64,'+$scope.image.img.base64;
		// console.log($scope.image.img64);
	}

	$scope.upFile = function() {
		document.querySelector('input.noshow').click();
	}

	$scope.popup = dataFactory._alert;

	$scope.cont = function(){
		$scope.data = {}
		console.log($scope.pass.pass_1);	

		  // An elaborate, custom popup
		var myPopup = $ionicPopup.show({
		    template: '<input type="password" ng-model="data.pass" passmall>',
		    title: 'Enter Old Password',
		    scope: $scope,
		    buttons: [
		      { 
		      	text: 'Cancel',
		      	onTap: function(e){
		      		return "cancel";
		      	}
		      },
		      {
		        text: '<b>Confirm</b>',
		        type: 'button-positive',
		        onTap: function(e) {
		          if (!$scope.data.pass) {
		            e.preventDefault();
		          } else {
		            return $scope.data.pass;
		          }
		        }
		      }
		    ]
		});
		myPopup.then(function(res) {
			console.log(res)
			if(res==="cancel")
				return;

			match   = md5.createHash(res || '');

			if(match===$scope.pass.oldPass)
				$scope.updateUser();
			else
				dataFactory._alert("Incorrect Password","The Password you Entered was Incorrect, try again!");

			console.log(res,$scope.pass.oldPass,match);
		});
  	}
})

.controller('orgController', function($scope, dataFactory,$stateParams) {

	$scope.organizaions = null;
	$scope.checkedOrgs = {};
	checkProto = {is_checked:false}

	dataFactory._loading(true,'Fetching Organizations');
	dataFactory.service('GET','http://app.octantapp.com/api/organization').
	then(function(res){
		ob = res.data.feed_id;
		co = {}
		for(key in ob){
			angular.extend(ob[key], checkProto);
			co[ob[key].org_id] = ob[key];
		}
		$scope.organizaions = co;

		dataFactory._loading(true,'Fetching Your Organizations');
		dataFactory.service('POST','http://app.octantapp.com/api/donor_org_get',{donor_id:App_Session.donor_id,is_active:1}).
		then(function(res){
			console.log(res.data);
			for(key in res.data){
				console.log(res.data[key]);
				$scope.organizaions[res.data[key]].is_checked = true;
				$scope.checkOrg(res.data[key])
				console.log($scope.organizaions);
				console.log($scope.checkedOrgs);

			}
		}).
		finally(function(){
			dataFactory._loading(false);
		})

	},
	function(res){
		dataFactory._alert("No Internet",res.err)
	}).
	finally(function(){
		dataFactory._loading(false);

	})


	$scope.checkOrg = function(org_id){
		if($scope.organizaions[org_id].is_checked){
			$scope.checkedOrgs[org_id] = $scope.organizaions[org_id];
			$scope.checkedOrgs[org_id].is_active = 1;
			console.log($scope.checkedOrgs);
		}
		else{
			// delete $scope.checkedOrgs[org_id];
			console.log($scope.checkedOrgs);
			$scope.organizaions[org_id].is_checked = false;
			$scope.checkedOrgs[org_id].is_active = 0;
		}
	}

	$scope.conferOrgs = function(){
		$scope.checkedOrgs;
		$scope.data = []
		clength = 0;
		// {
		// 	donor_id: App_Session.donor_id,
		// 	org_id: $scope.checkedOrgs[0]
		// }

		for(key in $scope.checkedOrgs){
			var temp = 
				{
					'donor_id': App_Session.donor_id,
					'org_id': $scope.checkedOrgs[key].org_id,
					'is_active': $scope.checkedOrgs[key].is_active
				}
			
			$scope.data.push(temp);
			clength++
		}

		console.log(clength)
		if(clength>0){

			console.log($scope.data);

			dataFactory.service('POST','http://app.octantapp.com/api/donor_org',$scope.data).
				then(function(res){
					r = res;
					console.log(res);
					dataFactory._alert('Successful','Organizaions Updated Successfully');
				}, function(res){
					console.log(res);
					dataFactory._alert('Failed','Some Error occured');
				})
				.finally(function(){
					dataFactory._go('app.home');
				})
		}
		else{
			dataFactory._alert('No Organization Selected','Please Select atleast 1 Organization');
			console.log(clength);
		}
			
	}

})
.controller('forgotController', function($scope, dataFactory, $ionicPopup) {
	$scope.forgot = {
		email: "",
		sec_question: "none",
		sec_answer: ""
	}

	$scope.data = {
		email: false
	}

	dataFactory._loading(true);
	dataFactory.sec_question().then(function(res){
		$scope.questions = res.data.feed_id;
		console.log($scope.questions);
	}).
	finally(function(){dataFactory._loading(false);})

	$scope.forgotsub = function(){
		qCheck = false;
		for(key in $scope.questions){
			if($scope.questions[key].question == $scope.forgot.sec_question){
				qCheck = true;
				break;
			}
		}
		if(qCheck){
			if($scope.forgot.sec_answer.length>6){
				var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	    		if(re.test($scope.forgot.email)){
					dataFactory._loading(true,'Resetting Password');
	    			dataFactory.service('POST','http://app.octantapp.com/api/reset_pswrd',$scope.forgot).
	    				success(function(data, textStatus, xhr){
	    					console.log(data);
	    					if(!data.Error){
		    					$scope.getPass().then(function(d){
		    						if(d==false)
		    							return;

		    						if(d)
										if(!(d.length > 8)){
											dataFactory._alert("Incorrect Password", "The length should be 9 characters");
											return;
										}

		    						$scope.data.donor_id = data.donor_id;
		    						console.log(d);

		    						dataFactory.service('PUT','http://app.octantapp.com/api/reset_pswrd_upd',$scope.data).
		    						then(function(res){
		    							// console.log(res);
		    							dataFactory._alert('Updated Successfully');
		    						})
		    					});
		    					// dataFactory.service('PUT','http://app.octantapp.com/api/reset_pswrd_upd',$scope.data)
		    				}
		    				else{
		    					dataFactory._alert("Error","The credentials do not match");
		    					$scope.data.email = true;
		    				}
	    				}).
	    				error(function(status){
	    					console.log(status);
	    				}).finally(function(){
	    					dataFactory._loading(false);
	    				})
	    		}
	    		else{
	    			dataFactory._alert("Invalid Entry","Please input a valid Email");
	    			return;
	    		}
	    	}
			else{
				dataFactory._alert("Invalid Entry","Answer Length too short, ("+$scope.forgot.sec_answer.length+") characters");
				return;
			}
		} else {
			dataFactory._alert("Invalid Entry","Please Select a Question from the dropdown");
			return;
		}
	}

	$scope.EmailCreds = function(){
		dataFactory._loading(true,'Sending Email');
		dataFactory.service('POST','http://app.octantapp.com/api/forgetpassword/123456789',$scope.forgot).
		then(function(res){
			console.log(res.data);
		}).
		finally(function(){
			dataFactory._loading(false);
		})
	}

	$scope.getPass = function(){
		$scope.data = {}
		return myPopup = $ionicPopup.show({
		    template: '<input type="password" ng-model="data.password" passmall><span class="err"></span>',
		    title: 'Match Found',
		    subTitle: 'Enter New Password',
		    scope: $scope,
		    buttons: [
		      { 
		      	text: 'Cancel',
		      	onTap: function(e){
		      		return false;
		      	}
		      },
		      {
		        text: '<b>Confirm</b>',
		        type: 'button-positive',
		        onTap: function(e) {
		          if (!$scope.data.password || ($scope.data.password.length<8)) {
		          	document.querySelector('span.err').innerHTML = 'Password Too Short';
		            e.preventDefault();
		          } else {
		            return $scope.data.password;
		          }
		        }
		      }
		    ]
		});
	}
})

.controller('tncController', function($scope, dataFactory) {
	k = null;

	head = null;
	body = [];
	$scope.terms = API.storage.get("terms");

	dataFactory.service('GET',"http://app.octantapp.com/api/do/oct5678093672").
		then(function(res){
			k = res.data.tc_id;
			terms = [];
			// console.log(k);
			for (var i = 0; i < k.length; i++) {

				// console.log(terms);

				l = document.createElement('div');
				l.innerHTML = k[i].tc_donor;

				//fetch h1
				var h = l.getElementsByTagName("h1")[0]
				// console.log(h.innerHTML,h);
				hd = {"head":h.innerHTML};
				h.remove();

				//fetch everything else in order
				for (var j = 0; j < l.childElementCount; j++) {
					body[j] = {
						id: j.toString(),
						html: l.children[j].outerHTML
					}
				};
				//mix them together
				terms[i] = {"head":hd.head,"body":body};
				console.log(terms[i]);
				body = [];
			};
			$scope.terms = terms;

		})

	$scope.toggleGroup = function(group) {
		if ($scope.isGroupShown(group)) {
				$scope.shownGroup = null;
		} else {
			$scope.shownGroup = group;
		}
	};
	$scope.isGroupShown = function(group) {
		return $scope.shownGroup === group;
	};

})

.controller('privacyController', function($scope, dataFactory) {
	k = null;

	head = null;
	body = [];
	$scope.privacy = API.storage.get("privacy");

	dataFactory.service('GET',"http://app.octantapp.com/api/pr/oct5678093672").
		then(function(res){
			k = res.data.tc_id;
			privacy = [];
			console.log(k);
			for (var i = 0; i < k.length; i++) {

				console.log(k[i]);

				l = document.createElement('div');
				l.innerHTML = k[i].privacy_terms;

				//fetch h1
				var h = l.getElementsByTagName("h1")[0]
				console.log(h.innerHTML,h);
				head = h.innerHTML;
				h.remove();

				//fetch everything else in order
				for (var j = 0; j < l.childElementCount; j++) {
					body[j] = {
							id: j.toString(),
							html: l.children[j].outerHTML};
				};
				//mix them together
				privacy[i] = {"head":head,"body":body};
				body = [];
			};
			API.storage.set('privacy',privacy);
			console.log(privacy);
			$scope.privacy = privacy;

		})

	$scope.toggleGroup = function(group) {
		if ($scope.isGroupShown(group)) {
				$scope.shownGroup = null;
		} else {
			$scope.shownGroup = group;
		}
	};
	$scope.isGroupShown = function(group) {
		return $scope.shownGroup === group;
	};

})

.controller('LoginController', function($scope, facebookService, md5, dataFactory, $cordovaGeolocation) {

  did = API.storage.get('donorId')
  rem = API.storage.get('remember')
  if(!rem){
  	$scope.destroySess(did,false);
  }
  else if(rem){
	$scope.updateSession();
	dataFactory._go('app.home');
  }


	$scope.user = {
		email : null,
		password : null,
		latitude: null,
		longitude: null,
		remember: false
	}
	$scope.pass = "";

	dataFactory._coordinates().
		then(function (position) {
		    $scope.user.latitude  = position.coords.latitude;
		    $scope.user.longitude = position.coords.longitude;
		    console.log(position);
	    })

	$scope.login = function(){
		if($scope.user.remember)
			$scope.user.login_info = 1
		console.log($scope.user)
		dataFactory._loading(true,'logging in');
		$scope.user.password = md5.createHash($scope.user.pass || '');
		// console.log($scope.user);
		dataFactory.service('POST',"http://app.octantapp.com/api/userlogin/123456789",
			$scope.user).
			then(function(res){

				var uid = res.data.Sucess;
				console.log(res.data)
				if(uid != "false"){
					// console.log(uid);
					API.storage.set('email',$scope.user.email);
					API.storage.set('donorId',uid.donor_id);
					API.storage.set('donorName',uid.first_name+" "+uid.last_name);
					API.storage.set('donorImage',uid.image);
					API.storage.set('remember',$scope.user.remember);
					$scope.updateSession();
					dataFactory._go('app.home');
				}
				else{
					dataFactory._alert("Error","Cannot Sign in with the given credentials");
					console.log(uid);
					return;
				}


			},function(res){
				console.log(res);
			}).finally(function(){
				dataFactory._loading(false);
			});
	}

//
})

.controller('SignupController', function($scope, $http, $state, dataFactory) {
	$scope.newuser = {
		"image"					: null,
		"donor_id"				: null,
		"email"					: null,
		"password"				: null,
		"first_name"			: null,
		"last_name"				: null,
		"zip"					: null,
		"image"					: null,
		"salutation"			: null,
		"address_1"				: null,
		"address_2"				: null,
		"city"					: null,
		"state"					: null,
		"cellphone"				: null,
		"employer"				: null,
		"position"				: null,
		"is_terms_accepted"		: false,
		"t_c_timestamp"			: null,

		"device_type"			: null,
		"device_identification"	: null, 
		"device_os"				: null, 
		"octant_donor_version"	: null, 
		"updated_on"			: null,

		"latitude"				: null,
		"longitude"				: null
	}

	var authFlags = {
		"email"				: "Email",
		"password"			: "Password",
		"first_name"		: "First Name",
		"last_name"			: "Last Name",
		"zip"				: "Zip Code",
		"is_terms_accepted"	: "Terms & Conditions",
	}


	dataFactory._coordinates().
		then(function (position) {
		    $scope.newuser.latitude  = position.coords.latitude;
		    $scope.newuser.longitude = position.coords.longitude;
		    console.log(position);
	    })


	$scope.signup = function(ev) {
		var error = "";
		var errorFlag = false;

		document.getElementById('signup').disabled = true;

		for(key in authFlags){
			if($scope.newuser[key]==null||!$scope.newuser[key]){
				error += "-" + authFlags[key] + "<br/>";
				errorFlag = true;
			}
		}
		document.getElementById('signup').disabled = false;
		if(errorFlag){
			dataFactory._alert("Incomplete Form","Please Complete the form <br/>"+error);
			return;
		}
		else{
			var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
			var rep = /^[a-zA-Z0-9]{8,20}$/
    		if(!re.test($scope.newuser.email)){
    			dataFactory._alert("Incomplete Form","Invalid Email");
    			return;
    		}
    		if(!rep.test($scope.newuser.password)){
    			dataFactory._alert("Incomplete Form","Your password must be between 6 and 20 characters. It must contain a mixture of upper and lower case letters, and at least one number or symbol.");
    			return;
    		}
		}

		dataFactory._loading(true,'Please wait while we Sign You Up');

		k = $scope.newuser;
		console.log($scope.newuser);

		$scope.userauth = {
			"donor_authentication_id": null,
			"donor_id": null,
			"email": $scope.newuser.email,
			"password": $scope.newuser.password,
			"save_login_info_app": null
		}

		dataFactory.service('Post', ' http://app.octantapp.com/api/donor', $scope.newuser).
			success(function (data, status, headers, config) {
				console.log(data);
				console.log('success');
				if(data.Error && data.Message.code == "ER_DUP_ENTRY"){
					dataFactory._alert("Error","Duplicate Email Found")
					return;
				}
			}).
			error(function (res) {
				console.log('error');
			}).
			then(function(res){
				if(res.Error)
					return;

				API.storage.set('donorId',res.data.donor_id);
				API.storage.set('donorName',res.data.donor_first_name+" "+res.data.donor_last_name);

				$scope.updateSession();
				$scope.updateProf();
				dataFactory._alert("Success","User Creation successful");
				dataFactory._go('app.org');
				document.getElementById('signup').disabled = true;
			}).
			finally(function(){
				dataFactory._loading(false);
		});
	} 

})

.controller('EventsController', function($scope, dataFactory) {

	console.log($scope.datify(0),'date');

	$scope.lala = true;
	$scope.readme = false;
	$scope.events = API.storage.get("event_"+App_Session.donor_id);
	var donid = App_Session.donor_id;

	dataFactory._loading(true,'Loading Events');
	dataFactory.service("POST","http://app.octantapp.com/api/msg_feeds",{'donor_id':donid}).
		success(function(data, textStatus, xhr){
			var feeder = {};
			var x = data.feed_id;
			for(i in x){
				if(x[i].msg_type_id==2){
					x[i].link_id = i;
					feeder[i] = x[i];					
				}
			}
			$scope.events = feeder;
			API.storage.set("event_"+App_Session.donor_id,feeder);
			console.log($scope.events);
		}).
		error(function() {
			console.log("NO INTERNET");
			$scope.events = API.storage.get("event_"+App_Session.donor_id);
			console.log($scope.events);
		}).
		finally(function(){
			dataFactory._loading(false);
		});
		
	$scope.isreadchk = function(message_id){
		$scope.events[message_id].is_read = true;
	}

	$scope.donatetoorg = function(orgid){
		dataFactory._go('app.donate',{'orgid':orgid})
	}

})

.controller('MessagesController', function($scope, dataFactory) {

	$scope.lala = true;
	$scope.readme = false;
	$scope.messages = API.storage.get("msg_"+App_Session.donor_id);
	var donid = App_Session.donor_id;

	dataFactory._loading(true,'Loading Messages');
	dataFactory.service("POST","http://app.octantapp.com/api/msg_feeds",{'donor_id':donid}).
		success(function(data, textStatus, xhr){
			var feeder = {};
			var x = data.feed_id;
			for(i in x){
				console.log(x[i].msg_type_id)
				if(x[i].msg_type_id==1){
					x[i].link_id = i;
					feeder[i] = x[i];					
				}
			}
			$scope.messages = feeder;
			API.storage.set("msg_"+App_Session.donor_id,feeder);
			console.log($scope.messages);
		}).
		error(function() {
			console.log("NO INTERNET");
			// dataFactory._alert("");
			$scope.feeds = API.storage.get("msg_"+App_Session.donor_id);
		}).
		finally(function(){
			dataFactory._loading(false);
		});
		
	$scope.isreadchk = function(message_id){
		$scope.messages[message_id].is_read = true;
		dataFactory.service('POST','http://app.octantapp.com/api/message_read/123456789',{'msg_id':message_id, 'donor_id':donid}).
			success(function(data, textStatus, xhr) {
				console.log(data);
			}).
			error(function(data, textStatus, xhr) {
				console.log(data);
			});
	}

	$scope.donatetoorg = function(orgid){
		dataFactory._go('app.donate',{'orgid':orgid})
	}

	$scope.datify = function(dt){
		return new Date(dt).toISOString().slice(0, 19).replace('T', ' ');
		// return dty;
	}

})

.controller('DonateController', function($scope,$window,$ionicSlideBoxDelegate,$ionicPopup,$stateParams,dataFactory,$ionicModal,$timeout) {

	$scope.profile = API.storage.get('userProf');

	$scope.data = {
		fee: 5,
		amount: null,
		slide: null,
		address_line1: $scope.profile.address_1,
		address_line2: $scope.profile.address_2,
		address_zip: $scope.profile.zip,
		address_city: $scope.profile.city,
		address_state: $scope.profile.state,
		email: $scope.profile.email
	};

	$scope.price = []

	$scope.postData = {}
	slto = 0

	$scope.slides = []
	$scope.organizaions = {}
	$scope.billing = {}

	dataFactory._loading(true,'Fetching Organizaions');
	dataFactory.service('POST','http://app.octantapp.com/api/donor_org_get',{donor_id:App_Session.donor_id,is_active:1}).
	then(function(res){
		sorgids = res.data;
		dataFactory.service('GET','http://app.octantapp.com/api/organization').
		then(function(res){
			console.log("data:",res.data)
			ob = res.data.feed_id;
			$scope.organizaions = ob
			count = 0;
			console.log(ob);
			for(key in ob){
				for(key1 in sorgids){
					if(sorgids[key1]==ob[key].org_id){
						count++;
						$scope.slides.push({
							image: ob[key].logo_full,
							org_id: ob[key].org_id,
							title: ob[key].name,
							desc: ob[key].descrip,
							org_message: ob[key].org_message,
							address: ob[key].address_1 + "; " + ob[key].address_2,
							city: ob[key].city,
							zip: ob[key].zip,
							state: ob[key].state,
							ext_flag: ob[key].is_external_needed,
							link_payment: ob[key].link_payment,
							tel: "+92 321 9579365",
						});
						if($stateParams.orgid==ob[key].org_id)
							slto = count;						
					}
				}
			}
			console.log("slides",$scope.slides);
	    	$ionicSlideBoxDelegate.update();
	    	// console.log(slto);
	    	// API.storage.set('organizaions',$scope.organizaions);
		}).
		finally(function(){
			dataFactory._loading(false);
	    	angular.element(document).ready(function () {
		    	$ionicSlideBoxDelegate.slide(slto);
		    	if(slto>0){
		    		$scope.billing = $scope.slides[slto-1];
		    		$scope.data.slide = slto;
		    	}
			    else
			    	$scope.billing = {
						image: null,
						org_id: null,
						title: null,
						desc: null,
						address: null,
						city: null,
						zip: null,
						state: null,
						tel: null,
					}
			    // console.log('page loading completed');
			});
		})
	})

	$scope.dataChanged = function(selectedItem){
		$scope.data.amount = selectedItem;
	}
	
	$scope.stripe = function() {
	    $ionicModal.fromTemplateUrl('templates/checkout.html', {
	    	scope: $scope
	    }).then(function(modal) {
	    	$scope.modal = modal;
	    	$scope.modal.show();
	    });
	};

	$scope.oct_donate = function(ext_flag){
		if(ext_flag){
			var lnk = $scope.billing.link_payment
			console.log(lnk);
			if(lnk.slice(0, 8)=="https://" || lnk.slice(0, 7)=="http://")
				$window.location.href = $scope.billing.link_payment.toString();
			else
				$window.location.href = 'http://'+$scope.billing.link_payment.toString();
			return;
		}
		$scope.data.amountCent = $scope.data.amount*100;
    	console.log($scope.data.amountCent);


		if($scope.data.slide>0){
			console.log($scope.data.amount,min)
			if($scope.data.amount>=min){
		    	$scope.stripe();
			}
			else{
				dataFactory._alert('Amount Error','Kindly Enter a Number Greater than the Min Amount ($'+min+')');
			}
		}
		else{
			dataFactory._alert('Organization','Please Select an Organization');
		}
		console.log($scope.data);
	}

	var min = 0
		rserr = false;
	$scope.slideC = function(index){
		document.getElementById('dondon').setAttribute('disabled',true);
		$scope.data.slide = index;
		console.log($scope.data,index);
		if(index>0){
			min = 0

	    	$scope.billing = $scope.slides[index-1];
	    	console.log($scope.billing.org_message)

			dataFactory.service('POST','http://app.octantapp.com/api/defaultdon',{'org_id':$scope.billing.org_id}).
			then(function(res){
				console.log(res.data);
				rserr = res.data.Error;
				if(!res.data.Error){
					v = res.data.Values
					vss = []
					for(key in v){
						if(min==0 || min > v[key]){
							min = v[key]
						}
						vss.push(v[key])
						console.log(v[key]);
					}
					$scope.price = vss
				}
				else{
					dataFactory._alert("Cannot fetch Amount list from this organization, try again later");
					document.getElementById('pricelist').selectedIndex = 0;
					document.getElementById('pricelist').disabled = true;
					document.getElementById('pricelist').value = null;
				}
			}).
			finally(function(res){
				if(!rserr){
					$timeout(function(){
						document.getElementById('pricelist').selectedIndex = 1;
						document.getElementById('pricelist').removeAttribute('disabled');
						document.getElementById('dondon').removeAttribute('disabled');
						$scope.data.amount = document.getElementById('pricelist').value;
						$scope.data.selectedItem = $scope.data.amount
					}, 50);
				}
			})
	    }
	    else{
			$scope.price = []
	    	$scope.billing = {
				image: null,
				org_id: null,
				title: null,
				data: null,
				address: null,
				city: null,
				zip: null,
				state: null,
				tel: null
			}

			document.getElementById('pricelist').disabled = true

		}

		console.log(index);
	}


  $scope.closeMod = function() {
    $scope.modal.hide();
  };

})

.controller('StripeController', function($scope,dataFactory) {
	$scope.postData = {}

	ionic.DomUtil.ready(function(){
		$('input#c_number').payment('formatCardNumber');
		$('input#c_cvc').payment('formatCardCVC');
		$('input#c_exp').payment('formatCardExpiry')		
	})


	console.log($scope.data);

	$scope.checkout = function(){


		if(
			$scope.data.expiry 			&&
			$scope.data.number 			&&
			$scope.data.cvc 			&&
			$scope.data.email			&&
			$scope.data.address_city	&&
			$scope.data.address_line1	&&
			$scope.data.address_line2	&&
			$scope.data.address_state	&&
			$scope.data.address_zip
		){
			$scope.postData.exp_month = $scope.data.expiry.slice(0,2) 
			$scope.postData.exp_year = $scope.data.expiry.slice(5,$scope.data.expiry.length)
			$scope.postData.amount = $scope.data.amountCent
			$scope.postData.number = $scope.data.number
			$scope.postData.cvc = $scope.data.cvc
			$scope.postData.donor_id = App_Session.donor_id
			$scope.postData.org_id = $scope.billing.org_id
			$scope.postData.email = $scope.data.email

			$scope.postData.address_city = $scope.data.address_city
			$scope.postData.address_line1 = $scope.data.address_line1
			$scope.postData.address_line2 = $scope.data.address_line2
			$scope.postData.address_state = $scope.data.address_state
			$scope.postData.address_zip = $scope.data.address_zip
		}
		else{
			dataFactory._alert("Missing Feilds","Please Fill up the missing feilds");
			return;
		}

		var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

		console.log($scope.postData);
		// console.log($scope.data)
		if(! re.test($scope.postData.email)){
			dataFactory._alert("Data Error","Invalid Email")
			return
		}
		if(! $.payment.validateCardNumber($scope.postData.number) ){
			dataFactory._alert("Data Error","Invalid Card Number")
			return
		}
		if(! $.payment.validateCardExpiry($scope.postData.exp_month,$scope.postData.exp_year) ){
			dataFactory._alert("Data Error","Invalid Expiry Date")
			return			
		}
		if(! $.payment.validateCardCVC($scope.postData.cvc) ){
			dataFactory._alert("Data Error","Invalid CVC")
			return			
		}

    	dataFactory.service('POST','http://app.octantapp.com/scrape',$scope.postData).
    	then(function(res){
    		if(res.data.success){
    			dataFactory._alert(
    				'<img src="'+$scope.billing.image+'" style="width:100px;margin:0 auto" /><br/><br/>Donation Successful',
    				'ThankYou for you kind Donations'
    			)
    		}
    		else{
	    		dataFactory._alert("Error","Something went wrong, please try again later");
    		}
    		console.log(res.data);
    	}).
    	finally(function(){
		    $scope.modal.hide();
    	})

	}

})

.controller('PledgeController', function($scope,$ionicSlideBoxDelegate,$ionicPopup,dataFactory,$stateParams,$timeout) {

	var minam = 0;
	$scope.profile = API.storage.get('userProf');

	$scope.profile = API.storage.get('userProf');

	$scope.data = {
		fee: 5,
		amount: null,
		slide: null,
		address_line1: $scope.profile.address_1,
		address_line2: $scope.profile.address_2,
		address_zip: $scope.profile.zip,
		address_city: $scope.profile.city,
		address_state: $scope.profile.state,
		email: $scope.profile.email
	};

	$scope.price = []

	$scope.postData = {}
	slto = 0

	$scope.slides = []
	$scope.organizaions = {}
	$scope.billing = {}

	dataFactory._loading(true,'Fetching your Organizaions');
	dataFactory.service('GET','http://app.octantapp.com/api/organization').
	then(function(res){
		ob = res.data.feed_id;
		dataFactory.service('POST','http://app.octantapp.com/api/donor_org_get',{donor_id:App_Session.donor_id,is_active:1}).
		then(function(res){
			sorgids = res.data;
				$scope.organizaions = ob
				count = 0;
				console.log(ob);
				for(key in ob){
					for(key1 in sorgids){
						if(sorgids[key1] == ob[key].org_id){
							count++;
							$scope.slides.push({
								image: ob[key].logo_full,
								org_id: ob[key].org_id,
								title: ob[key].name,
								desc: ob[key].descrip,
								address: ob[key].address_1 + " " + ob[key].address_2,
								city: ob[key].city,
								zip: ob[key].zip,
								state: ob[key].state,
								tel: "+92 321 9579365"

							});
							if($stateParams.orgid==ob[key].org_id)
								slto = count;
						}
					}
				}
				console.log($scope.slides);
		    	$ionicSlideBoxDelegate.update();
		    	// console.log(slto);
		    		// API.storage.set('organizaions',$scope.organizaions);				
		});
	}).
	finally(function(){
    	angular.element(document).ready(function () {
	    	$ionicSlideBoxDelegate.slide(slto);
	    	if(slto>0){
	    		$scope.billing = $scope.slides[slto];
	    		$scope.data.slide = slto;
	    	}
		    else
		    	$scope.billing = {
					image: null,
					org_id: null,
					title: null,
					desc: null,
					address: null,
					city: null,
					zip: null,
					state: null,
					tel: null,
				}

		    // console.log('page loading completed');
		});
		dataFactory._loading(false);
	})

	$scope.dataChanged = function(selectedItem){
		console.log(selectedItem)
		$scope.data.amount = selectedItem;
	}
	$scope.oct_pledge = function(){

		if($scope.data.slide>0){
			$scope.data.org_id = $scope.slides[$scope.data.slide-1].org_id
			$scope.data.donor_id = App_Session.donor_id;
			if($scope.data.amount>=minam){
				dataFactory.service('POST','http://app.octantapp.com/api/pledge',$scope.data).
				then(function(res){
					console.log(res);
					$scope.showAlert();
				})
				
			}
			else{
				dataFactory._alert('Amount Error','Kindly Enter a Number Greater than the Min Amount ($'+minam+')');
			}
		}
		else{
			dataFactory._alert('Organization Error','No Organizaions Selected');
		}
		console.log($scope.data);
	}
	rserr = false;
	$scope.slideC = function(index){
		document.getElementById('dondon').setAttribute('disabled',true);
		$scope.data.slide = index;
		console.log($scope.data,index);
		if(index>0){
			min = 0

	    	$scope.billing = $scope.slides[index-1];

			dataFactory.service('POST','http://app.octantapp.com/api/defaultdon',{'org_id':$scope.billing.org_id}).
			then(function(res){
				console.log(res.data);
				rserr = res.data.Error;
				if(!res.data.Error){
					v = res.data.Values
					vss = []
					for(key in v){
						if(min==0 || min > v[key]){
							min = v[key]
						}
						vss.push(v[key])
						console.log(v[key]);
					}
					$scope.price = vss
					minam = vss[0];
				}
				else{
					dataFactory._alert("Cannot fetch Amount list from this organization, try again later");
					document.getElementById('pricelist').selectedIndex = 0;
					document.getElementById('pricelist').disabled = true;
					document.getElementById('pricelist').value = null;
				}
				console.log(rserr,res.data.Error)
			}).
			finally(function(res){
				if(!rserr){
				console.log(rserr)
					$timeout(function(){
						document.getElementById('pricelist').selectedIndex = 1;
						document.getElementById('pricelist').removeAttribute('disabled');
						document.getElementById('dondon').removeAttribute('disabled');
						$scope.data.amount = document.getElementById('pricelist').value;
						$scope.data.selectedItem = $scope.data.amount
					}, 50);
				}
			})
	    }
	    else{
			$scope.price = []
	    	$scope.billing = {
				image: null,
				org_id: null,
				title: null,
				data: null,
				address: null,
				city: null,
				zip: null,
				state: null,
				tel: null
			}

			document.getElementById('pricelist').disabled = true

		}
	}

	$scope.showAlert = function() {
		x = $scope.data;
		console.log(x)
		dataFactory._alert(
			'<img src="'+$scope.billing.image+'" style="width:100px;margin:0 auto" /><br/><br/>Donation Successful',
			'ThankYou for you kind Donations')
	};
})

.run(function($rootScope, $ionicModal, dataFactory) {
	
	/*
	 * if given group is the selected group, deselect it
	 * else, select the given group
	 */
	$rootScope.toggleGroup = function(group) {
		group.show = !group.show;
	};
	$rootScope.isGroupShown = function(group) {
		return group.show;
	};

	$rootScope.$on('flag.error.conn',function(){
		dataFactory._alert("No Connection","You Deivce is currently disconnected from the internet. Using Cached Data if available");
	});

})

.factory('facebookService', function($q) {
    return {
        getMyLastName: function() {
            var deferred = $q.defer();
            FB.api('/me', {
                fields: 'last_name'
            }, function(response) {
                if (!response || response.error) {
                    deferred.reject('Error occured');
                } else {
                    deferred.resolve(response);
                }
            });
            return deferred.promise;
        }
    }
})

.factory('dataFactory', function($http, $rootScope, $ionicPopup, $ionicLoading, $state, $cordovaGeolocation) {

	return {

		service: function(_method, _url, _data){
			if(!_data||_data==undefined)
				data=null;
			return $http({ method: _method, url: _url, data: _data });
		},

		_alert: function(alertHead,alertMessage,alertThen){
				 var alertPopup = $ionicPopup.alert({
					 title: alertHead,
					 template: alertMessage
				 });
				 alertPopup.then(function(res) {
						if(typeof alertThen === 'function')
							alertThen();
				 });

		},
		_loading: function(flag,msg){
	        tem = '<ion-spinner icon="lines"></ion-spinner><br/>'
			tem += (msg) ? msg+"<br/>" : 'Loading...';
			
			if(flag){
				$ionicLoading.show({
			      template: tem
			    });
			}
			else
			if(!flag){
				$ionicLoading.hide();
			}
		},
		_go: function(str,params){
			$state.go(str,params);
		},
		_coordinates: function(){

			var posOptions = {timeout: 10000, enableHighAccuracy: true};
			var gps = $cordovaGeolocation.getCurrentPosition(posOptions);
			console.log(gps);
			return gps
		},
		sec_question: function(){
		    return this.service('GET','http://app.octantapp.com/api/sec_quest')
		}
	}

})

.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
  	field.reverse();
    var filtered = [];

    angular.forEach(items, function(item) {
      filtered.push(item);
    });

    angular.forEach(field, function(value, key){
	    filtered.sort(function (a, b) {
	    	// console.log(a[field[]],b[field]);
	      return (a[field[key][0]] > b[field[key][0]] ? 1 : -1);
	    });    	
	    if(field[key][1]) filtered.reverse();
    });
    return filtered;
  };
})

.directive('passmall', function() {
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
           if(inputValue == undefined) inputValue = '';
           var capitalized = inputValue.toLowerCase();
           if(capitalized !== inputValue) {
              modelCtrl.$setViewValue(capitalized);
              modelCtrl.$render();
            }         
            return capitalized;
         }
         modelCtrl.$parsers.push(capitalize);
         capitalize(scope[attrs.ngModel]);  // capitalize initial value
     }
   };
})

.directive('baseImage', ['$window', function ($window) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elem, attrs, ngModel) {
      var fileObject = {};

      scope.readerOnload = function(e){
        var base64 = _arrayBufferToBase64(e.target.result);
        fileObject.base64 = base64;
        scope.$apply(function(){
          ngModel.$setViewValue(fileObject);
        });
      };

      var reader = new FileReader();
      reader.onload = scope.readerOnload;

      elem.on('change', function() {
        var file = elem[0].files[0];
        fileObject.filetype = file.type;
        fileObject.filename = file.name;
        fileObject.filesize = file.size;
        reader.readAsArrayBuffer(file);
      });

      //http://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
      function _arrayBufferToBase64( buffer ) {
        var binary = '';
        var bytes = new Uint8Array( buffer );
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return $window.btoa( binary );
      }
    }
  };
}]);


var limit = 10;
var accounts = [];
var posts = [];
var author_names = [];
var author_profiles = [];
var no_profile_image = 'https://steemit-production-imageproxy-thumbnail.s3.amazonaws.com/U5ds8wePoj1V1DoRR4bzzKUARNiywjp_64x64';
var explorer = "https://steemit.com";

$(function () {
  getQuery();
  getFeed();
});

function getFeed(){
  if(accounts.length == 0) console.log("No accounts");
  feedLoaded = 0;
  accounts.forEach(function(account){
    var query = {
      limit:limit,
      tag:account
    };
    steem.api.getDiscussionsByBlog(query, function(err, result){
      feedLoaded++;
      if (err || !result){
        console.log('Error loading account feed: ' + err);
        return;
      }
      
      for(var i=0;i<result.length;i++){
        posts.push(result[i]);
        if(typeof author_names.find(function(a){return a==result[i].author}) === 'undefined'){
          author_names.push(result[i].author);  
        }
      }
      
      if(feedLoaded == accounts.length){
        steem.api.getAccounts(author_names, function(err, result){
          if (err || !result){
            console.log('Error loading profile pictures: ' + err);            
          }else{
            for(var i=0;i<result.length;i++){
              result[i].profile_image = extractUrlProfileImage(result[i]);
              author_profiles.push(result[i]);
            }  
          }
          
          posts.sort(function(a,b){
            dateA = new Date(a.created+'Z');
            dateB = new Date(b.created+'Z');
            if(dateA > dateB) return -1;
            if(dateA < dateB) return 1;
            return 0;
          });
        
          $('#post_list').text("");
          for(var i=0;i<posts.length;i++) $('#post_list').append(postHtml(posts[i]));        
        });        
      }
    });
  });
}

function postHtml(post){
  var json_metadata = JSON.parse(post.json_metadata);
  tag = json_metadata.tags[0];
  if(typeof json_metadata.image === 'undefined'){
    if(typeof json_metadata.thumbnail === 'undefined') url_image = '';
    else url_image = json_metadata.thumbnail;
  }else url_image = json_metadata.image[0];
  
  profile_image = no_profile_image;
  author = author_profiles.find(function(a){return a.name==post.author}); 
  
  if(typeof author !== 'undefined'){
    profile_image = author.profile_image;    
  }
  //console.log(profile_image);
      
  text = ''+ 
    '<div class="post">'+
    '  <div class="row">'+
    '    <div class="user_name col-sm-6 col-xs-6">'+
    '      <span class="profile_image>'+
    '        <a href="'+explorer+'/@'+post.author+'">'+
    '          <img class="img-responsive img-circle userpic" src="'+profile_image+'"/>'+
    '        </a>'+
    '      </span>'+    
    '      <span class="author">'+
    '        <strong>'+
    '          <a href="'+explorer+'/@'+post.author+'">'+post.author+'</a>'+
    '        </strong>'+
    '      </span>'+
    '      <span class="tag">'+
    '        in '+tag+
    '      </span>'+
    '    </div>'+       
    '  </div>'+
    '  <div class="row">'+
    '    <div class="col-sm-2 col-xs-12 post_image">'+
    '      <a href="'+explorer+post.url+'">'+
    '        <img class="img-responsive" src="'+url_image+'"/>'+
    '      </a>'+
    '    </div>'+
    '    <div class="col-sm-10 col-xs-12 post_content">'+
    '      <div class="row post_title">'+
    '        <strong>'+
    '          <a href="'+explorer+post.url+'">'+post.title+'</a>'+
    '        </strong>'+
    '      </div>';  /*console.log(text);*/return text; 
}


function getQuery(){
  var kvp = document.location.search.substr(1).split('&');	
  
  if(kvp != ''){
    var i = kvp.length; 	
    while (i--) {
      var x = kvp[i].split('=');
      if (x[0] == 'accounts'){
        acc = x[1].split(',');
        accounts = [];
        for (var j=0;j<acc.length;j++) accounts.push(acc[j]);
      }
    }
  }  
}

function extractUrlProfileImage(account){
  var json_metadata = JSON.parse(account.json_metadata);
  if(typeof json_metadata.profile !== 'undefined' && typeof json_metadata.profile.profile_image !== 'undefined' ){
    url = json_metadata.profile.profile_image;
    if(url.substring(0,8) == "![image]"){
      return url.substring(9, url.length - 1);
    }
    console.log(url);
    return url;
  }
  return no_profile_image;  
}
var limit = 10;
var accounts = [];
var posts = [];
//var author_names = [];
//var author_profiles = [];
//var no_profile_image = 'https://steemit-production-imageproxy-thumbnail.s3.amazonaws.com/U5ds8wePoj1V1DoRR4bzzKUARNiywjp_64x64';
var explorer = "https://steemit.com";
var firstTime = true;
var idLastPostShowed = -1;
var runningGetFeed = false;

now = new Date();
var rpc_nodes = [
  {url:"https://api.steemit.com",timeLastResponse:now},
  {url:"https://rpc.buildteam.io",timeLastResponse:now},
  {url:"https://steemd.minnowsupportproject.org",timeLastResponse:now},
  {url:"https://steemd.privex.io",timeLastResponse:now},
  {url:"https://gtg.steem.house:8090",timeLastResponse:now}  
];
var id_rpc_node = 1;

$(function () {
  $('#changing-node').hide();
  setApiNode();  
  getQuery();
  getFeed();
  
  checkTime();
  setInterval(checkTime, 2000);
  
  $(window).on("scroll", function() {
	var scrollHeight = $(document).height();
	var scrollPosition = $(window).height() + $(window).scrollTop();
	if ((scrollHeight - scrollPosition) / scrollHeight === 0) {
	  if(!runningGetFeed) getFeed();
	}
  });
});

function getFeed(){
  runningGetFeed = true;
  var endFeed = true;
  var actual_node = id_rpc_node;
  rpc_nodes[actual_node].timeLastResponse = new Date();    
  
  if(accounts.length == 0) console.log("No accounts");
  var numResponses = 0;  
  $('#error-loading').hide();
  
  accounts.forEach(function(account){
    if(account.last.end) return;
    endFeed = false;
    
    $('.loader').show();    
    var query = {
      limit:limit,
      tag:account.name,
      start_author:account.last.author,
      start_permlink:account.last.permlink
    };
    
    steem.api.getDiscussionsByBlog(query, function(err, result){
      if(actual_node != id_rpc_node) return;
      
      numResponses++;      
      rpc_nodes[actual_node].timeLastResponse = new Date();
      if (err || !result){
        console.log('Error loading account feed: ' + err);
        if(numResponses < accounts.length) return;
        
        id_rpc_node++;
        if(id_rpc_node < rpc_nodes.length){
          $('#changing-node').html('<strong>Problems with the connection!</strong> We are changing to node <strong>'+rpc_nodes[id_rpc_node].url+'</strong>. Thanks for waiting.');
          $('#changing-node').show();
          setApiNode();   
          getFeed();          
        }else{
          $('#error-loading').show();
          $('#changing-node').hide();
          $('.loader').hide();
          id_rpc_node = 0;
          runningGetFeed = false;
          console.log("Error loading. Problems with all nodes");
        }
        return;
      }
      
      if(result.length > 0){
        var end = false;
        if(result.length == 1) end = true;
        lastPost = {
          author:result[result.length-1].author,
          permlink:result[result.length-1].permlink,
          end:end
        };
      }
      accounts.find(function(a){return a.name == account.name}).last = lastPost;
      
      var i=1;
      if(firstTime) i=0;
      while(i<result.length){
        if(typeof posts.find(function(p){return p.author == result[i].author && p.permlink == result[i].permlink}) === 'undefined'){
          posts.push(result[i]);
        }        
        /*if(typeof author_names.find(function(a){return a==result[i].author}) === 'undefined'){
          author_names.push(result[i].author);  
        }*/
        i++;
      }
      
      if(numResponses == accounts.length){
        /*steem.api.getAccounts(author_names, function(err, result){
          if (err || !result){
            console.log('Error loading profile pictures: ' + err);            
          }else{
            for(var i=0;i<result.length;i++){
              result[i].profile_image = extractUrlProfileImage(result[i]);
              author_profiles.push(result[i]);
            }  
          }       
        });*/
        posts.sort(function(a,b){
          dateA = new Date(a.created+'Z');
          dateB = new Date(b.created+'Z');
          if(dateA > dateB) return -1;
          if(dateA < dateB) return 1;
          return 0;
        });
        
        for(var i=idLastPostShowed+1;i<posts.length;i++){          
          if(typeof accounts.find(function(a){return a.last.author == posts[i].author && a.last.permlink == posts[i].permlink&& a.last.end==false}) !== 'undefined') break;
          $('#post_list').append(postHtml(posts[i]));
          idLastPostShowed = i;
        }
        $('.loader').hide();
        $('#changing-node').hide();
        firstTime = false;
        runningGetFeed = false;
        console.log("Posts loaded");
      }
    });
  });
  if(endFeed){
    runningGetFeed = false;  
    console.log("No more posts to show");
  }  
}

function checkTime(){
  if(!runningGetFeed) return;
  var t = rpc_nodes[id_rpc_node].timeLastResponse;
  if(new Date() - t > 10000){
    console.log("Time expired: aborted");
    id_rpc_node++;
    if(id_rpc_node == rpc_nodes.length) id_rpc_node = 0;
    
    $('#changing-node').html('<strong>Time expired!</strong> We are changing to node <strong>'+rpc_nodes[id_rpc_node].url+'</strong>. Thanks for waiting.');
    $('#changing-node').show();
    
    setApiNode();
    getFeed();
  }
}

function postHtml(post){
  var json_metadata = JSON.parse(post.json_metadata);
  tag = json_metadata.tags[0];
  if(typeof json_metadata.image === 'undefined'){
    if(typeof json_metadata.thumbnail === 'undefined') url_image = '';
    else url_image = json_metadata.thumbnail;
  }else url_image = json_metadata.image[0];
  
  /*profile_image = no_profile_image;
  author = author_profiles.find(function(a){return a.name==post.author});  
  if(typeof author !== 'undefined'){
    profile_image = author.profile_image;    
  }*/
  profile_image = 'https://steemitimages.com/u/'+post.author+'/avatar/small';
    
  text = ''+ 
    '<div class="post">'+
    '  <div class="row">'+
    '    <div class="user_name col-sm-6 col-xs-6">'+
    '      <span class="profile_image">'+
    '        <a href="'+explorer+'/@'+post.author+'">'+
    '          <img class="img-responsive img-circle userpic" src="'+profile_image+'"/>'+
    '        </a>'+
    '      </span>'+    
    '      <span class="author">'+
    '        <strong>'+
    '          <a href="'+explorer+'/@'+post.author+'">'+post.author+'</a>'+
    '        </strong>'+
    '        ('+getReputation(post.author_reputation)+')'+
    '      </span>'+
    '      <span class="tag">'+
    '        in '+tag+
    '      </span>'+
    '      <span class="timestamp">'+
    '        • '+getTimestamp(post.created)+
    '      </span>'+
    '    </div>'+       
    '  </div>'+
    '  <div class="row">'+
    '    <div class="col-sm-2 col-xs-12">'+
    '      <div class="post_image crop">'+
    '        <a href="'+explorer+post.url+'">'+
    '          <img class="img-responsive" src="'+url_image+'"/>'+
    '        </a>'+
    '      </div>'+
    '    </div>'+
    '    <div class="col-sm-10 col-xs-12 post_content">'+
    '      <div class="col-sm-12">'+
    '        <div class="row post_title">'+
    '          <strong>'+
    '            <a href="'+explorer+post.url+'">'+post.title+'</a>'+
    '          </strong>'+
    '        </div>'+
    '      </div>'+
    '      <div class="col-sm-12">'+
    '        <div class="row post_content">'+getContentText(post.body).substring(0,100)+
    '        ...</div>'+
    '      </div>'+
    '      <div class="col-sm-1 col-xs-4">$'+getPayout(post)+'</div>'+
    '      <div class="col-sm-1 col-xs-4">'+UPVOTES_SVG+'<span class="align-image">'+post.active_votes.length+'</span></div>'+
    '      <div class="col-sm-1 col-xs-4">'+REPLIES_SVG+'<span class="align-image">'+post.children+'</span></div>'+
    '    </div>'+
    '  </div>'+
    '</div>';    /*console.log(text);*/ return text; 
}


function getQuery(){
  var kvp = document.location.search.substr(1).split('&');	
  
  if(kvp != ''){
    var i = kvp.length; 	
    while (i--) {
      var x = kvp[i].split('=');
      if (x[0] == 'accounts'){
        names = x[1].split(',');
        accounts = [];
        for (var j=0;j<names.length;j++){
          var acc = {
            name:names[j],
            last:{
              author:'',
              permlink:'',
              end:false
            }
          };
          accounts.push(acc);
        }
      }
    }
  }  
}

function setApiNode(){
  var n = id_rpc_node;
  if(n >= rpc_nodes.length) return false;
  steem.api.setOptions({ transport: 'http', uri: rpc_nodes[n].url, url: rpc_nodes[n].url });
  console.log('RPC Node: '+rpc_nodes[n].url); 
  return true;
}


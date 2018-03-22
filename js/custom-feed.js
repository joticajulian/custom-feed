var limit = 10;
var querys = [];
var typeGetDiscussions = 'trending';
var posts = [];
//var author_names = [];
//var author_profiles = [];
//var no_profile_image = 'https://steemit-production-imageproxy-thumbnail.s3.amazonaws.com/U5ds8wePoj1V1DoRR4bzzKUARNiywjp_64x64';
var explorer = "https://steemit.com";
var firstTime = true;
var runningGetFeed = false;

var steem_price = 0;
var reward_balance = 0;
var recent_claims = 1;


//Filter options
var MIN_REP = -1000;
var MAX_REP = 1000;
var MIN_PAYOUT = 0;
var MAX_PAYOUT = 1000000;
var MIN_PAYOUTCOMMENT = 0;
var MAX_PAYOUTCOMMENT = 1000000;
var MIN_VOTES = 0;
var MAX_VOTES = 10000000;
var MIN_COMMENTS = 0;
var MAX_COMMENTS = 10000000;
var MIN_BODYLENGTH = 0;
var MAX_BODYLENGTH = 10000000;
var MIN_TIMESTAMP = new Date('2016-01-01');
var MAX_TIMESTAMP = new Date();
var TAGS_ALLOWED = [];
var TAGS_AVOIDED = [];
var VOTES_ALLOWED = [];
var VOTES_AVOIDED = [];
var RESTEEM = true;
var expirationTime = 10;

now = new Date();
var rpc_nodes = [
  {url:"https://api.steemit.com",timeLastResponse:now},
  {url:"https://steemd.pevo.science",timeLastResponse:now},
  {url:"https://seed.bitcoiner.me",timeLastResponse:now},
  {url:"https://rpc.buildteam.io",timeLastResponse:now},
  {url:"https://minnowsupportproject.org",timeLastResponse:now},
  {url:"https://steemd.minnowsupportproject.org",timeLastResponse:now},
  {url:"https://steemd.privex.io",timeLastResponse:now},
  {url:"https://gtg.steem.house:8090",timeLastResponse:now}  
];
var id_rpc_node = 0;

$(function () {
  $('#changing-node').hide();
  $('#error-loading').hide();
  $('#loading-more').hide();
  $('.loader').hide();
  setApiNode();  
  getQuery();
  initConnectionSteemApi();
});

function handleErrorPrice(err){
  console.log("Error loading the price data: "+err);
  id_rpc_node++;
  if(id_rpc_node == rpc_nodes.length) id_rpc_node = 0;
  setApiNode();
  initConnectionSteemApi();
}

function initConnectionSteemApi(){  
  steem.api.getCurrentMedianHistoryPrice(function(err, result){
    if (err || !result){
      handleErrorPrice(err);
      return;
    }
    
    steem_price = parseFloat(result.base.replace(" SBD",""))/parseFloat(result.quote.replace(" STEEM",""));
    console.log("steem_price: "+steem_price);
    
    steem.api.getRewardFund("post", function(err, result){    
      if (err || !result){
        handleErrorPrice(err);
        return;
      }
    
      reward_balance = parseFloat(result.reward_balance.replace(" STEEM",""));
      recent_claims = parseInt(result.recent_claims);
      console.log("reward_balance: "+reward_balance);
      console.log("recent_claims: "+recent_claims);
      
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
  });  
}

function getFeed(){
  runningGetFeed = true;
  var endFeed = true;
  var actual_node = id_rpc_node;
  rpc_nodes[actual_node].timeLastResponse = new Date();    
  
  if(querys.length == 0 && typeGetDiscussions != 'blog' && typeGetDiscussions != 'feed'){
    querys.push({
      tag:'',
      last:{
        author:'',
        permlink:'',
        end:false
      }
    });
  }
  
  var numResponses = 0;  
  $('#error-loading').hide();
  
  querys.forEach(function(query){
    if(query.last.end) return;
    endFeed = false;
    
    $('.loader').show();    
    var q = {
      limit:limit,
      tag:query.tag
    };
    if(query.last.author != ''){
      q.start_author = query.last.author;
      q.start_permlink = query.last.permlink;
    } 

    switch(typeGetDiscussions){
      case 'trending':
        steem.api.getDiscussionsByTrending(q,function(err, result){
          numResponses = resolveResponse('trending',err,result,actual_node,query,numResponses);
        });
        break;
      case 'created':
        steem.api.getDiscussionsByCreated(q,function(err, result){
          numResponses = resolveResponse('created',err,result,actual_node,query,numResponses);
        });
        break;
      case 'hot':
        steem.api.getDiscussionsByHot(q,function(err, result){
          numResponses = resolveResponse('hot',err,result,actual_node,query,numResponses);
        });
        break;
      case 'feed':
        steem.api.getDiscussionsByFeed(q,function(err, result){
          numResponses = resolveResponse('feed',err,result,actual_node,query,numResponses);
        });
        break;
      case 'blog':
        steem.api.getDiscussionsByBlog(q,function(err, result){
          numResponses = resolveResponse('blog',err,result,actual_node,query,numResponses);
        });
        break;
      default:
        $('#error-loading').html('Please select a type (trending, created, hot, feed, blog)').show();
    }
  });
  
  if(endFeed){
    runningGetFeed = false;
    $('#loading-more').html('<strong>End</strong>. No more posts to show').show();
    console.log("No more posts to show");
  }  
}
    
function resolveResponse(queryType,err, result,actual_node,query,numResponses){
      if(actual_node != id_rpc_node) return;
      
      numResponses++;             
      rpc_nodes[actual_node].timeLastResponse = new Date();
      var postsPassedFilter = 0;
            
      if (err || !result){
        console.log('Error loading query feed: ' + err);
        if(numResponses < querys.length) return;
        
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
        var lastPost = {
          author:result[result.length-1].author,
          permlink:result[result.length-1].permlink,
          created:new Date(result[result.length-1].created+'Z'),
          end:end
        };
      }
      querys.find(function(q){return q.tag == query.tag}).last = lastPost;
      
      var i=1;
      if(firstTime) i=0;
      while(i<result.length){
        
        //look if this post is a resteem or not
        if(queryType == 'blog' && result[i].author != query.tag) result[i].reblogged_by[0] = query.tag;
        
        //add post to the list if passes filter
        if(typeof posts.find(function(p){return p.author == result[i].author && p.permlink == result[i].permlink}) === 'undefined'){
          if(postPassFilter(result[i])){
            posts.push(result[i]);
            postsPassedFilter++;
          }
        }        
        i++;
      }
      
      if(numResponses == querys.length){
        posts.sort(function(a,b){
          dateA = new Date(a.created+'Z');
          dateB = new Date(b.created+'Z');
          if(dateA > dateB) return -1;
          if(dateA < dateB) return 1;
          return 0;
        });
        
        $('#post_list').text('');
        for(var i=0;i<posts.length;i++){
          if(typeof querys.find(function(q){return q.last.author == posts[i].author && q.last.permlink == posts[i].permlink && q.last.end==false}) !== 'undefined') break;
          $('#post_list').append(postHtml(posts[i]));                    
        }
        //if(firstTime) $('#post-data').html(getContentHtml(posts[0].body));
        $('.loader').hide();
        $('#changing-node').hide();
        firstTime = false;
        runningGetFeed = false;
        
        if(postsPassedFilter > 0){
          console.log(postsPassedFilter + " posts loaded");
          $('#loading-more').hide();
          if($(window).height() >= $(document).height()) getFeed();          
        }else{
          var creationLastPostShowed = new Date('2016-01-01');
          for(var i=0;i<querys.length;i++) if(querys[i].last.created > creationLastPostShowed) creationLastPostShowed = querys[i].last.created;          
          $('#loading-more').html('<strong>No recent posts!</strong> Looking for older posts (more than '+textTimeAgo(new Date() - creationLastPostShowed)+'). Please wait.').show();
          getFeed();
        }
      }
      return numResponses;
    }
   
  

function postPassFilter(post){
  var rep = getReputation(post.author_reputation);
  var json_metadata = JSON.parse(post.json_metadata);
  var tags = [];
  if(typeof json_metadata.tags != 'undefined') tags = json_metadata.tags;
  //var images = []; //TODO
  var payout = getPayout(post);
  var numVotes = post.active_votes.length;
  var votes = post.active_votes;
  var numComments = parseInt(post.children);
  var bodyLength = parseInt(post.body_length);
  var timestamp = new Date(post.created+'Z');
  var payoutComment = 0;
  if(numComments > 0) payoutComment = rshares2sbd(post.children_abs_rshares - post.abs_rshares)/numComments;
  
  if(rep >= MIN_REP && rep <= MAX_REP &&
     payout >= MIN_PAYOUT && payout <= MAX_PAYOUT &&
     payoutComment >= MIN_PAYOUTCOMMENT && payoutComment <= MAX_PAYOUTCOMMENT &&
     numVotes >= MIN_VOTES && numVotes <= MAX_VOTES &&
     numComments >= MIN_COMMENTS && numComments <= MAX_COMMENTS &&
     bodyLength >= MIN_BODYLENGTH && bodyLength <= MAX_BODYLENGTH &&
     timestamp >= MIN_TIMESTAMP && timestamp <= MAX_TIMESTAMP &&
     
     (TAGS_ALLOWED.length == 0 || (TAGS_ALLOWED.length > 0 && typeof TAGS_ALLOWED.find(function(t){for(var i=0;i<tags.length;i++) if(tags[i] == t) return true; return false;}) !== 'undefined')) &&
     
     (TAGS_AVOIDED.length == 0 || (TAGS_AVOIDED.length > 0 && typeof TAGS_AVOIDED.find(function(t){for(var i=0;i<tags.length;i++) if(tags[i] == t) return true; return false;}) === 'undefined')) &&
     
     (VOTES_ALLOWED.length == 0 || (VOTES_ALLOWED.length > 0 && typeof VOTES_ALLOWED.find(function(v){for(var i=0;i<votes.length;i++) if(votes[i].voter == v) return true; return false;}) !== 'undefined')) &&
     
     (VOTES_AVOIDED.length == 0 || (VOTES_AVOIDED.length > 0 && typeof VOTES_AVOIDED.find(function(v){for(var i=0;i<votes.length;i++) if(votes[i].voter == v) return true; return false;}) === 'undefined')) &&
     
     (RESTEEM || post.reblogged_by.length==0)
     
     ){
     
     return true;
   
   }else{
     
     return false;
   
   }  
}

function checkTime(){
  if(!runningGetFeed) return;
  var t = rpc_nodes[id_rpc_node].timeLastResponse;
  if(new Date() - t > expirationTime*1000){
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
  
  profile_image = 'https://steemitimages.com/u/'+post.author+'/avatar/small';
  
  divReblog = '';
  if(post.reblogged_by.length > 0){
    var resteemedText = '';
    for(var i=0;i<post.reblogged_by.length;i++){
      if(i == 0) resteemedText += post.reblogged_by[i];
      else resteemedText += ', ' + post.reblogged_by[i];
    }
    divReblog = ''+
      '  <div class="row">'+
      '    <div class="resteem col-sm-2 col-xs-6">'+REBLOG_SVG+'<span class="align-image">'+resteemedText+' resteemed</span></div>'+
      '  </div>';
  }  
  textPayoutChildren = '';
  if(new Date() < new Date(post.cashout_time+'Z')){
    textPayoutChildren = ' ($0.00)';
    if(parseInt(post.children) > 0){
      textPayoutChildren = ' ($'+rshares2sbd((post.children_abs_rshares-post.abs_rshares)/post.children).toFixed(2)+')';
    }
  }  
    
  text = ''+ 
    '<div class="post">'+divReblog+
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
    '      <div class="col-sm-1 col-xs-4">$'+getPayout(post).toFixed(2)+'</div>'+
    '      <div class="col-sm-1 col-xs-4">'+UPVOTES_SVG+'<span class="align-image">'+post.active_votes.length+'</span></div>'+
    '      <div class="col-sm-2 col-xs-4">'+REPLIES_SVG+
    '        <span class="align-image">'+post.children+textPayoutChildren+'</span>'+
    '      </div>'+
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
      if (x.length == 1) x.push('');
      if (x[0] == 'type'){
        typeGetDiscussions = x[1];
      }else if (x[0] == 'query'){
        var tags = x[1].split(',');
        querys = [];
        for (var j=0;j<tags.length;j++){
          var q = {
            tag:tags[j],
            last:{
              author:'',
              permlink:'',
              end:false
            }
          };
          querys.push(q);
        }
      }else if(x[0] == 'minrep'){
        MIN_REP = parseFloat(x[1]);
      }else if(x[0] == 'maxrep'){
        MAX_REP = parseFloat(x[1]);
      }else if(x[0] == 'minpayout'){
        MIN_PAYOUT = parseFloat(x[1]);
      }else if(x[0] == 'maxpayout'){
        MAX_PAYOUT = parseFloat(x[1]);
      }else if(x[0] == 'minpayoutcomment'){
        MIN_PAYOUTCOMMENT = parseFloat(x[1]);
      }else if(x[0] == 'maxpayoutcomment'){
        MAX_PAYOUTCOMMENT = parseFloat(x[1]);
      }else if(x[0] == 'minvotes'){
        MIN_VOTES = parseInt(x[1]);
      }else if(x[0] == 'maxvotes'){
        MAX_VOTES = parseInt(x[1]);
      }else if(x[0] == 'mincomments'){
        MIN_COMMENTS = parseInt(x[1]);
      }else if(x[0] == 'maxcomments'){
        MAX_COMMENTS = parseInt(x[1]);
      }else if(x[0] == 'minbody'){
        MIN_BODYLENGTH = parseInt(x[1]);
      }else if(x[0] == 'maxbody'){
        MAX_BODYLENGTH = parseInt(x[1]);
      }else if(x[0] == 'mintime'){
        MIN_TIMESTAMP = new Date(x[1]+'Z');//Todo: revisar GMT offset
      }else if(x[0] == 'maxtime'){
        MAX_TIMESTAMP = new Date(x[1]+'Z');
      }else if(x[0] == 'tags'){
        TAGS_ALLOWED = x[1].split(',');
      }else if(x[0] == 'notags'){
        TAGS_AVOIDED = x[1].split(',');
      }else if(x[0] == 'votes'){
        VOTES_ALLOWED = x[1].split(',');
      }else if(x[0] == 'novotes'){
        VOTES_AVOIDED = x[1].split(',');
      }else if(x[0] == 'expirationtime'){
        expirationTime = parseFloat(x[1]);
      }else if(x[0] == 'resteem'){
        RESTEEM = (x[1] == 'true');
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

function rshares2sbd(rs){
  return rs*(reward_balance/recent_claims)*steem_price;
}
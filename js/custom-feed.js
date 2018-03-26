var limit = 10;
var querys = [];
var typeGetDiscussions = 'trending';
var posts = [];
var totalPostsRequested = 0;
var totalPostsResponses = 0;
//var author_names = [];
//var author_profiles = [];
//var no_profile_image = 'https://steemit-production-imageproxy-thumbnail.s3.amazonaws.com/U5ds8wePoj1V1DoRR4bzzKUARNiywjp_64x64';
var DEFAULT_EXPLORER = "https://steemit.com";
var firstTime = true;
var runningGetFeed = false;
var numResponses = 0;
var postsPassedFilter = 0;

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
var AUTHORS_ALLOWED = [];
var AUTHORS_AVOIDED = [];
var VOTES_ALLOWED = [];
var VOTES_AVOIDED = [];
var RESTEEM = true;
var expirationTime = 10;
var explorer = DEFAULT_EXPLORER;

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

$('#explorer').change(function(){
  if(this.value == '6') $('#whatexplorer').show();
  else $('#whatexplorer').hide();
});

$('#selType').change(function(){
  var t = this.value;
  switch(t){
    case '1':
    case '2':
    case '3': 
      $('#label-query').text('Tags:'); 
      $('#query').attr('placeholder','Tags separated by commas');
      break;
    case '4':
    case '5':
    case '6': 
      $('#label-query').text('Accounts:'); 
      $('#query').attr('placeholder','Accounts separated by commas');
      break;
  }
  
  switch(t){
    case '4':
    case '5':
      $('#divhideresteem').show();
      break;
    default:
      $('#divhideresteem').hide();
  }
});

$(function () {
  $('#changing-node').hide();
  $('#error-loading').hide();
  $('#loading-more').hide();
  $('.loader').hide();
  
  $('#divhideresteem').hide();
  $('#whatexplorer').hide();
  setApiNode();  
  if(getQuery()) initConnectionSteemApi();
});

function search(){
  var options = {'1':'trending','2':'created','3':'hot','4':'feed','5':'blog','6':'votes'};
  var type = options[$('#selType').val()];
  var q = ($('#query').val()).replace(" ","");
  var minrep = ($('#minrep').val()).replace(" ","");
  var maxrep = ($('#maxrep').val()).replace(" ","");
  var minpayout = ($('#minpayout').val()).replace(" ","");
  var maxpayout = ($('#maxpayout').val()).replace(" ","");
  var minvotes = ($('#minvotes').val()).replace(" ","");
  var maxvotes = ($('#maxvotes').val()).replace(" ","");
  var mincomments = ($('#mincomments').val()).replace(" ","");
  var maxcomments = ($('#maxcomments').val()).replace(" ","");
  var minbody = ($('#minbody').val()).replace(" ","");
  var maxbody = ($('#maxbody').val()).replace(" ","");
  var minpayoutcomment = ($('#minpayoutcomment').val()).replace(" ","");
  var maxpayoutcomment = ($('#maxpayoutcomment').val()).replace(" ","");
  var tags = ($('#tags').val()).replace(" ","");
  var notags = ($('#notags').val()).replace(" ","");
  var authors = ($('#authors').val()).replace(" ","");
  var noauthors = ($('#noauthors').val()).replace(" ","");
  var votes = ($('#votes').val()).replace(" ","");
  var novotes = ($('#novotes').val()).replace(" ","");
  var resteem = $('#hideresteem').is(':checked')?'false':'true'; 
  var olderthan = ($('#olderthan').val()).replace(" ","");  
  var new_explorer = $('#explorer option:selected').text();
  if($('#explorer').val() == '6') new_explorer = $('#whatexplorer').val();
  
  qq = '?type='+type;  
  if(q != '') qq += '&'+'query='+q;
  if(minrep != '') qq += '&'+'minrep='+minrep;
  if(maxrep != '') qq += '&'+'maxrep='+maxrep;
  if(minpayout != '') qq += '&'+'minpayout='+minpayout;
  if(maxpayout != '') qq += '&'+'maxpayout='+maxpayout;
  if(minvotes != '') qq += '&'+'minvotes='+minvotes;
  if(maxvotes != '') qq += '&'+'maxvotes='+maxvotes;
  if(mincomments != '') qq += '&'+'mincomments='+mincomments;
  if(maxcomments != '') qq += '&'+'maxcomments='+maxcomments;
  if(minbody != '') qq += '&'+'minbody='+minbody;
  if(maxbody != '') qq += '&'+'maxbody='+maxbody;
  if(minpayoutcomment != '') qq += '&'+'minpayoutcomment='+minpayoutcomment;
  if(maxpayoutcomment != '') qq += '&'+'maxpayoutcomment='+maxpayoutcomment;
  if(tags != '') qq += '&'+'tags='+tags;
  if(notags != '') qq += '&'+'notags='+notags;
  if(authors != '') qq += '&'+'authors='+authors;
  if(noauthors != '') qq += '&'+'noauthors='+noauthors;
  if(votes != '') qq += '&'+'votes='+votes;
  if(novotes != '') qq += '&'+'novotes='+novotes;
  if(resteem == 'false') qq += '&'+'resteem='+resteem;
  if(olderthan != '') qq += '&'+'olderthan='+olderthan;
  if(new_explorer != DEFAULT_EXPLORER) qq += '&'+'explorer='+new_explorer;
  
  var url = "https://joticajulian.github.io/custom-feed/index.html"+qq;
  console.log("opening: "+url);
  window.open(url, "_self");
}

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
  numResponses = 0;
  postsPassedFilter = 0;
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
          resolveResponse('trending',err,result,actual_node,query);
        });
        break;
      case 'created':
        steem.api.getDiscussionsByCreated(q,function(err, result){
          resolveResponse('created',err,result,actual_node,query);
        });
        break;
      case 'hot':
        steem.api.getDiscussionsByHot(q,function(err, result){
          resolveResponse('hot',err,result,actual_node,query);
        });
        break;
      case 'feed':
        steem.api.getDiscussionsByFeed(q,function(err, result){
          resolveResponse('feed',err,result,actual_node,query);
        });
        break;
      case 'blog':
        steem.api.getDiscussionsByBlog(q,function(err, result){
          resolveResponse('blog',err,result,actual_node,query);
        });
        break;
      case 'votes':
        steem.api.getAccountHistory(query.tag,query.last.trans_id,limit, function(err, result){
          resolveResponseVotes('votes',err, result,actual_node,query);
        });
        break;      
      default:
        $('#error-loading').html('Please select a type (trending, created, hot, feed, blog, votes)').show();
        $('.loader').hide();            
        endFeed = true;
    }
  });
  
  if(endFeed){
    runningGetFeed = false;
    $('#loading-more').html('<strong>End</strong>. No more posts to show').show();
    console.log("No more posts to show");
  }  
}
    
function resolveResponse(queryType,err, result,actual_node,query){
      if(actual_node != id_rpc_node) return;
      
      numResponses++;             
      rpc_nodes[actual_node].timeLastResponse = new Date();
            
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
        querys.find(function(q){return q.tag == query.tag}).last = lastPost;
      }
      
      
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
    
function resolveResponseVotes(queryType,err, result,actual_node,query){
      if(actual_node != id_rpc_node) return;
      
      numResponses++;             
      rpc_nodes[actual_node].timeLastResponse = new Date();
            
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
      
      var end = false;
      if(result.length>0){
        var lastTrans = querys.find(function(q){return q.tag == query.tag}).last
        lastTrans.trans_id = result[0][0];
        lastTrans.created = new Date(result[0][1].timestamp+'Z');
        
        if(lastTrans.trans_id == 0) end = true;
        result = result.filter(function(r){return r[1].op[0] == 'vote' && r[1].op[1].voter == query.tag});
        
        if(result.length>0){
          lastTrans.author = result[0][1].op[1].author;
          lastTrans.permlink = result[0][1].op[1].permlink;
        }
        
      }
        
      querys.find(function(q){return q.tag == query.tag}).last = lastTrans;
      
      var i=result.length-2;
      if(firstTime) i=result.length-1;
      while(i>=0){
        var author = result[i][1].op[1].author;
        var permlink = result[i][1].op[1].permlink;
        if(typeof posts.find(function(p){return p.author == author && p.permlink == permlink}) === 'undefined'){
          totalPostsRequested++;
          steem.api.getContent(author,permlink,function(err,resp){
            rpc_nodes[actual_node].timeLastResponse = new Date();
            totalPostsResponses++;;
            
            if (err || !resp){
              console.log('Error loading post: ' + err);
              return;
            }
          
            if(totalPostsResponses <= totalPostsRequested){            
              if(postPassFilter(resp)){
                postsPassedFilter++;
                resp.voted_by = query.tag;
                posts.push(resp);                
              }
            }
            
            if(numResponses == querys.length && totalPostsResponses == totalPostsRequested){
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
                var tAgo = textTimeAgo(new Date() - creationLastPostShowed);
                $('#loading-more').html('<strong>No recent posts!</strong> Looking for older posts (more than '+tAgo+'). Please wait.').show();
                console.log("No recent posts! looking for older posts (more than "+tAgo+")");
                getFeed();
              }
            }            
          });
        }             
        i--;
      }
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
     
     (AUTHORS_ALLOWED.length == 0 || (AUTHORS_ALLOWED.length > 0 && typeof AUTHORS_ALLOWED.find(function(a){return a==post.author;}) !== 'undefined')) &&
     
     (AUTHORS_AVOIDED.length == 0 || (AUTHORS_AVOIDED.length > 0 && typeof AUTHORS_AVOIDED.find(function(a){return a==post.author;}) === 'undefined')) &&
     
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
 
  divVoted = '';
  if(typeof post.voted_by !== 'undefined'){
    var divVoted = ''+
      '  <div class="row">'+
      '    <div class="resteem col-sm-2 col-xs-6">'+UPVOTES_SVG+
      '      <span class="align-image"> voted by '+post.voted_by+'</span>'+
      '    </div>'+
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
    '<div class="post">'+divVoted+divReblog+
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

function toggleSearch(){
  $('#search-block').toggle();
  if($('#toogle-search').text() == 'Hide search options') $('#toogle-search').text('Show search options');
  else $('#toogle-search').text('Hide search options');
}

function getQuery(){
  if(typeof document.location.search == 'undefined' || document.location.search == '') return false;
  
  toggleSearch();  
  var kvp = document.location.search.substr(1).split('&');
  
  if(kvp != ''){
    var i = kvp.length; 	
    while (i--) {
      var x = kvp[i].split('=');
      if (x.length == 1) x.push('');
      if (x[0] == 'type'){
        typeGetDiscussions = x[1];
        var options = {'trending':'1','created':'2','hot':'3','feed':'4','blog':'5','votes':'6'};
        $('#selType').val(options[x[1]]);
      }else if (x[0] == 'query'){
        $('#query').val(x[1]);
        var tags = x[1].split(',');
        querys = [];
        for (var j=0;j<tags.length;j++){
          var q = {
            tag:tags[j],
            last:{
              author:'',
              permlink:'',
              trans_id:-1,
              end:false
            }
          };
          querys.push(q);
        }
      }else if(x[0] == 'minrep'){
        $('#minrep').val(x[1]);
        MIN_REP = parseFloat(x[1]);
      }else if(x[0] == 'maxrep'){
        $('#maxrep').val(x[1]);
        MAX_REP = parseFloat(x[1]);
      }else if(x[0] == 'minpayout'){
        $('#minpayout').val(x[1]);
        MIN_PAYOUT = parseFloat(x[1]);
      }else if(x[0] == 'maxpayout'){
        $('#maxpayout').val(x[1]);
        MAX_PAYOUT = parseFloat(x[1]);
      }else if(x[0] == 'minpayoutcomment'){
        $('#minpayoutcomment').val(x[1]);
        MIN_PAYOUTCOMMENT = parseFloat(x[1]);
      }else if(x[0] == 'maxpayoutcomment'){
        $('#maxpayoutcomment').val(x[1]);
        MAX_PAYOUTCOMMENT = parseFloat(x[1]);
      }else if(x[0] == 'minvotes'){
        $('#minvotes').val(x[1]);
        MIN_VOTES = parseInt(x[1]);
      }else if(x[0] == 'maxvotes'){
        $('#maxvotes').val(x[1]);
        MAX_VOTES = parseInt(x[1]);
      }else if(x[0] == 'mincomments'){
        $('#mincomments').val(x[1]);
        MIN_COMMENTS = parseInt(x[1]);
      }else if(x[0] == 'maxcomments'){
        $('#maxcomments').val(x[1]);
        MAX_COMMENTS = parseInt(x[1]);
      }else if(x[0] == 'minbody'){
        $('#minbody').val(x[1]);
        MIN_BODYLENGTH = parseInt(x[1]);
      }else if(x[0] == 'maxbody'){
        $('#maxbody').val(x[1]);
        MAX_BODYLENGTH = parseInt(x[1]);
      }else if(x[0] == 'mintime'){
        MIN_TIMESTAMP = new Date(x[1]+'Z');//Todo: revisar GMT offset
      }else if(x[0] == 'maxtime'){
        MAX_TIMESTAMP = new Date(x[1]+'Z');
      }else if(x[0] == 'tags'){
        $('#tags').val(x[1]);
        TAGS_ALLOWED = x[1].split(',');
      }else if(x[0] == 'notags'){
        $('#notags').val(x[1]);
        TAGS_AVOIDED = x[1].split(',');
      }else if(x[0] == 'authors'){
        $('#authors').val(x[1]);
        AUTHORS_ALLOWED = x[1].split(',');
      }else if(x[0] == 'noauthors'){
        $('#noauthors').val(x[1]);
        AUTHORS_AVOIDED = x[1].split(',');
      }else if(x[0] == 'votes'){
        $('#votes').val(x[1]);
        VOTES_ALLOWED = x[1].split(',');
      }else if(x[0] == 'novotes'){
        $('#novotes').val(x[1]);
        VOTES_AVOIDED = x[1].split(',');
      }else if(x[0] == 'expirationtime'){
        expirationTime = parseFloat(x[1]);
      }else if(x[0] == 'resteem'){
        $('#hideresteem').prop('checked', x[1]=='false');
        RESTEEM = (x[1] == 'true');
        if(!RESTEEM) $('#divhideresteem').show();
      }else if(x[0] == 'olderthan'){
        $('#olderthan').val(x[1]);
        MAX_TIMESTAMP = new Date()-x[1]*1000*60;
      }else if(x[0] == 'explorer'){
        explorer = x[1];
        var exp_option = $('#explorer option').filter(function(){ return this.text == explorer; });
        if(exp_option.length == 0){
          $('#explorer').val('6');
          $('#whatexplorer').val(explorer).show();
        }else{
          exp_option.attr('selected', true);
        }
      }
    }
  } 
  return true;  
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


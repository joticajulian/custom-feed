function getReputation(reputation){
  return Math.floor(9*Math.log10(parseInt(reputation))-56);
}

function getTimestamp(created){
  t = new Date() - new Date(created+'Z');
  if(t <= 1000) return '1 second ago';
  if(t < 60*1000) return (t/1000).toFixed(0) + ' seconds ago';
  if(t < 2*60*1000) return '1 minute ago';
  if(t < 60*60*1000) return (t/1000/60).toFixed(0) + ' minutes ago';
  if(t < 2*60*60*1000) return '1 hour ago';
  if(t < 24*60*60*1000) return (t/1000/60/60).toFixed(0) + ' hours ago';
  if(t < 2*24*60*60*1000) return 'yesterday';
  if(t < 30*24*60*60*1000) return (t/1000/60/60/24).toFixed(0) + ' days ago';
  if(t < 2*30*24*60*60*1000) return 'last month';
  if(t < 12*30*24*60*60*1000) return (t/1000/60/60/24/30).toFixed(0) + ' months ago';
  if(t < 2*12*30*24*60*60*1000) return 'last year';
  return (t/1000/60/60/24/30/12).toFixed(0) + ' years ago';
}

function getContentText(co){
  converter = new showdown.Converter();
  try{co=jQuery(co).text();}catch(err){}
  try{co=converter.makeHtml(co);}catch(err){}
  try{co=jQuery(co).text();}catch(err){}
  return co;
}

function extractUrlProfileImage(account){
  var json_metadata = JSON.parse(account.json_metadata);
  if(typeof json_metadata.profile !== 'undefined' && typeof json_metadata.profile.profile_image !== 'undefined' ){
    url = json_metadata.profile.profile_image;
    if(url.substring(0,8) == "![image]"){
      return url.substring(9, url.length - 1);
    }
    return url;
  }
  return no_profile_image;  
}

function getPayout(post){
  var pending = parseFloat(post.pending_payout_value);
  var payout = parseFloat(post.total_payout_value);
  if(pending > payout) return pending.toFixed(2);
  return payout.toFixed(2);
}

var UPVOTES_SVG = '<span class="Icon chevron-up-circle Icon_1x" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg enable-background="new 0 0 33 33" version="1.1" viewBox="0 0 33 33" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Chevron_Up_Circle"><circle cx="16" cy="16" r="15" stroke="#121313" fill="none"></circle><path d="M16.699,11.293c-0.384-0.38-1.044-0.381-1.429,0l-6.999,6.899c-0.394,0.391-0.394,1.024,0,1.414 c0.395,0.391,1.034,0.391,1.429,0l6.285-6.195l6.285,6.196c0.394,0.391,1.034,0.391,1.429,0c0.394-0.391,0.394-1.024,0-1.414 L16.699,11.293z" fill="#121313"></path></g></svg></span>';

var REPLIES_SVG = '<span class="Icon chatboxes" style="display: inline-block; width: 1.12rem; height: 1.12rem;"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve"><g><path d="M294.1,365.5c-2.6-1.8-7.2-4.5-17.5-4.5H160.5c-34.7,0-64.5-26.1-64.5-59.2V201h-1.8C67.9,201,48,221.5,48,246.5v128.9 c0,25,21.4,40.6,47.7,40.6H112v48l53.1-45c1.9-1.4,5.3-3,13.2-3h89.8c23,0,47.4-11.4,51.9-32L294.1,365.5z"></path><path d="M401,48H183.7C149,48,128,74.8,128,107.8v69.7V276c0,33.1,28,60,62.7,60h101.1c10.4,0,15,2.3,17.5,4.2L384,400v-64h17 c34.8,0,63-26.9,63-59.9V107.8C464,74.8,435.8,48,401,48z"></path></g></svg></span>';
'use strict';

(function() {

  // init socket.io
  var socket = io();

  // Var to init canvas
  var canvas = document.getElementsByClassName('whiteboard')[0];
  var colors = document.getElementsByClassName('color');
  var context = canvas.getContext('2d');

  // Var to hold user id
  let id;

  // line drawing color
  var current = {
    color: 'black'
  };

  // Var to hold if user it in charge of drawing
  var drawing = false;


  //Collect and init user information
  socket.on('connect', () => {
    // grab user socket it
    id = socket.id;

    //Capture name with JS prompt alert
    let name = prompt("What is your name?");
    name = name ? name : "lazy";
    //Update HTML with name
    document.querySelector('.name').innerHTML = name;
    document.querySelector('.drawer').innerHTML = name;

    //Emit new user + name
    socket.emit('add user', name);
  });


  // Set newest users to the drawer
  // 'new user' is matching emited name from index.js
  socket.on('new user', function(user){

    // Manage that only the LAST user gets to draw
    // If you are NOT the last user connect
    // change data attribute to false on canvas remove ability to draw

    if (id != user.id) {
      // Log shows up in browser console
      console.log(id + "-" + user.id)
      document.querySelector('.drawer').innerHTML = user.name;
      canvas.setAttribute('data-drawer', 'false');
    }

  });


  // Detect drawing with mouse
  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

  //Touch support for mobile devices
  canvas.addEventListener('touchstart', onMouseDown, false);
  canvas.addEventListener('touchend', onMouseUp, false);
  canvas.addEventListener('touchcancel', onMouseUp, false);
  canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

  // Detect click on a color
  for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', onColorUpdate, false);
  }

  // When server emits 'drawing', trigger onDrawingEvent function
  socket.on('drawing', onDrawingEvent);

  // Reside canvas when browser size changes
  window.addEventListener('resize', onResize, false);
  onResize();


  // Input data from server and draw same line on canvas
  function drawLine(x0, y0, x1, y1, color, emit){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    // Drawing is portional to user's canvas size
    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    // Emit the drawing data to the server and to users
    // You can CHANGE the data format here (and server)
    // to match Google Quick Draw (3 arrays: x, y, & t)
    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }

  // Get start position of drawing
  function onMouseDown(e){
    drawing = true;
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
  }

  // Draw line with drawing stops
  function onMouseUp(e){
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true);
  }


  // Draw line as mouse/touch moves
  function onMouseMove(e){
    if (!drawing) { return; }
    drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true);
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
  }

  // Update color
  function onColorUpdate(e){
    current.color = e.target.className.split(' ')[1];
  }

  // limit the number of events per second to send less data
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  // Draw line from server (other users lines)
  function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

})();

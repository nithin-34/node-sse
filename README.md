# node-sse
server side events in node js


#client side
const eventSource = new EventSource('http://127.0.0.1:8081/users')
  to connect to the sse 
eventSource.onmessage = (event) => {}
  to get the message from the server
eventSource.onerror = () => {}
  if ther was an error from server
  
#server
create a GET method with content-type:text\event-stream

resp.write(`data:your resposne data`)
  to send data to the client who connected to our sse endpoint

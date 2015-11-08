  $(window).load(function(){
  
      $("#inputForm").submit(function(event) {
        event.preventDefault();
         
        sensors = [];
        
        list = $("input[type='checkbox']");
        
        for(obj in list) {
          if(list[obj].checked) sensors.push($(list[obj]).attr('value'));
        }
        
        console.log("submit");
        onSubmitRequest("2014-05-08 10:00:00","",sensors.slice(0,2));
      
      });
  });
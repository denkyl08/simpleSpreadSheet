$(window).on('load', function() {

    Table({
      name: 'exampleTable',
      slot: 1,
      rows:10,
      columns:10,
      setCellContent: function(content) {
        console.log(content);
      }
    })

});
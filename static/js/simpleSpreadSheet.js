var context;
var tables = [];
//var t;

$(window).on('load', function() {
  var canvasObj = $('<canvas id="myCanvas" width="578" height="200"></canvas>');
  $(window.document.body).append(canvasObj);
  context = document.getElementById('myCanvas').getContext('2d');
  document.getElementById('myCanvas').width = 1000;
  document.getElementById('myCanvas').height = 1000;
  context.font = '12pt serif';
  splitWordByPixelWidth('thisisatestoftheemergencyalertsystem', 60);
})


// TABLES Objects
var Cell = function(spec) {

  //Private variables
  var cellElem = spec.jQElem;
  var input = $('<textArea type="text" rows="1" ></textArea');
  var id = spec.cellId;
  var column = spec.cellColumn;
  var row = spec.cellRow;
  var table = spec.parentTable;
  var value;
  var content;

  //Public object
  var returnObj = {
    row : row,
    col : column,
    contents : function(newContent) {
      if (newContent !== undefined){
        content = newContent;
        value = content; // create some sort of parsing here instead of simply assigning value to content
        if (table.setCellContent && typeof table.setCellContent == 'function'){
          table.setCellContent(content);
        } else {
          console.log('setCellContent must be a function.')
        }
      } else {
        return content;
      }
    },
    value : function() {
      return value;
    },
    elem : function() {
      return cellElem;
    },
    input : function() {
      return input;
    },
    table : function() {
      return table;
    },
    id : function() {
      return id;
    },
    openCell : function() {
      if (table.openCell() != undefined) {
        closeCell( table.openCell() );
      }
      table.openCell(returnObj);
      cellElem.empty();
      cellElem.css('background-color', 'whitesmoke');
      input[0].value = content;
      input.val(content);
      cellElem.append(input);
      input.focus();
    }
  }

  //Cell events
  cellElem.on('click', function() {
    returnObj.openCell();
    cellElem.height(0);
    cellElem.height(input[0].scrollHeight);
  })
  cellElem.on('keypress', function(event) {
    if (event.which == 13) {  //enter
      event.preventDefault();
      closeCell(returnObj);
      if (!table.cellDict()[numToCol(column)+(row+1)]) {
        table.addRows(1);
      }
      table.cellDict()[numToCol(column)+(row+1)].openCell();
    }
    if (input.val().length>140) {
      event.preventDefault();
    }
  })
  cellElem.on('keyup', function(event) {
    if (input.val().length>140) {
      return
    }
    if ((event.which != 37) && (event.which != 38) && (event.which != 39) &&
          (event.which != 40) && (event.which != 9) && (event.which != 13) ) {
      if (returnObj.contents() != input.val()) {
        returnObj.contents(input.val(), true);
      }
    }
    cellElem.height(0);
    cellElem.height(input[0].scrollHeight);
    
  });
  cellElem.on('keydown', function(event) {

    var nextCell;
    var cellDict = table.cellDict();
    if (event.which == 37) { //left arrow
      event.preventDefault();
      nextCell = cellDict[numToCol((column-1))+row]
    }
    if (event.which == 39 || event.which == 9) { //right arrow or tab
      event.preventDefault();
      nextCell = cellDict[numToCol((column+1))+row];
      if (!nextCell) {
        if ( (column+1) <200) {
          table.addColumns(1);
          nextCell = cellDict[numToCol((column+1))+row];
        }
      }
    }
    if (event.which == 38) { //up arrow
      event.preventDefault();
      nextCell = cellDict[numToCol((column))+(row-1)];
    }
    if (event.which == 40) { //down arrow
      event.preventDefault();
      nextCell = cellDict[numToCol((column))+(row+1)];
      if (!nextCell) {
        table.addRows(1);
        nextCell = cellDict[numToCol((column))+(row+1)]
      }
    }
    if (nextCell) {
        closeCell(returnObj);
        nextCell.openCell();
        if (event.which == 38 || event.which == 37) {
            clearTimeout(table.timingHandles().trim)
            table.timingHandles().trim = setTimeout( function() {
              table.trimTable(nextCell);
            } , 1);
        }
    }
    
  })
  //return public object
  return returnObj;
}

var Table = function (spec) {

  //Private variable
  var slot = spec.slot;
  var totalrows = 0;
  var totalcols = 0;
  var id = '';
  var input = $('<input type="file" id="input">');
  var tableElem = $('<table><thead></thead><tbody></tbody></table>');
  var cellDict = {};
  var openCell;
  var mouseDown = false;
  var state = 'open' //open or select
  var timingHandles = {trim:''};

    id  = spec.name;
    
    if (window.FileReader) {
    $('#' + id).append('Import a .csv file ' , input);
    input.change(function() {
      var oFReader = new FileReader();
      oFReader.readAsText(this.files[0]);
      oFReader.onload = function (oFREvent) {
        importCsv(oFREvent.target.result);
      };
    });
  } else {
    $('#' + id).append('Update your browser to upload csv files');
  }


    //Public object
    var returnObj = {
      slot: function() {
        return slot;
      },
      timingHandles: function() {
        return timingHandles;
      },
      addColumns: function (n) {
        var now =  (new Date().getTime());
        if (totalcols+n>702) {
          throw "Error: "+id+" cannot exceed 702 columns";
          alert('Error: Too many columns in table ' + id);
        }
        for (var col = totalcols+1; col < (totalcols+1) + n; col++) {
          for (var row = 1; row < totalrows+1; row++) {
            var colId = numToCol(col);
            var elem = $('<td id="' + id + '_' + colId + String(row) + '"></td>');
            $('#'+id+'_row' + String(row)).append(elem);
            cellDict[colId + String(row)] = Cell({
                                                  jQElem: elem, 
                                                  cellId: (colId + String(row)),
                                                  cellColumn: col,
                                                  cellRow: row,
                                                  parentTable: this
                                                });
          }
        }
        totalcols += n;

      },
      addRows : function (n) {
        var now =  (new Date().getTime());
        for (var row = totalrows+1; row < (totalrows+1) + n; row++) {
          var cur_row_elem = $('<tr id="'+id+'_row' + String(row) + '"></tr>');
          $(tableElem.children('thead')).append(cur_row_elem);
          for (var col = 1; col < totalcols+1; col++) {
            var colId = numToCol(col);
            var elem = $('<td id="' + id + '_' + colId + String(row) + '"></td>');
            cur_row_elem.append(elem);
            cellDict[colId + String(row)] = Cell({
                                                  jQElem: elem, 
                                                  cellId: (colId + String(row)),
                                                  cellColumn: col,
                                                  cellRow: row, 
                                                  parentTable: this
                                                });
          }
        }
        totalrows += n;
      },
      trimTable : function(curCell) {
            var emptyRow = false;
            // Trims all empty rows. Stops trimming if a cell on the row is currently open
            while (curCell.row < totalrows) {
              for (var col = 1; col <= totalcols; col++) {
                var cell = cellDict[numToCol(col) + String(totalrows)];
                if (cell && cell.contents()) {
                  emptyRow = true;
                  break;
                }
              }
              if (emptyRow) {break;};
              if (totalrows != 1) {
                for (var tcol = 1; tcol <= totalcols; tcol++) {
                  var tcell = cellDict[numToCol(tcol) + String(totalrows)];
                  if (tcell) {
                    tcell.elem().remove();
                    delete cellDict[numToCol(tcol) + String(totalrows)];
                  }
                }
                tableElem.children().children('tr').last().remove();
                totalrows -= 1;
              } else {
                break;
              }
            }
            
            // Trims all empty columns. Stops trimming if a cell on the column is currently open
            while(curCell.col < totalcols) {
              for (var row = 1; row <= totalrows; row++) {
                var cell = cellDict[numToCol(totalcols) + String(row)];
                if (cell &&  cell.contents()) {
                  return;
                }
              }
              if (totalcols != 1) {
                for (var trow = 1; trow <= totalrows; trow++) {
                  var tcell = cellDict[numToCol(totalcols) + String(trow)];
                  if (tcell) {
                    tcell.elem().remove();
                    delete cellDict[numToCol(totalcols) + String(trow)];
                  }
                }
                totalcols -= 1;
              }
            }
      },
      updateTableSize : function(rows, cols) {
        console.log('The server told me to grow to '+rows+' rows and '+cols+' columns.');
        this.trimTable( {'row':1, 'col':1} );
        this.addRows(rows-totalrows);
        this.addColumns(cols-totalcols);
      },
      cell : function(cellId) {
        return cellDict[cellId];
      },
      openCell: function(cell) {
        if (cell === undefined) {
          return openCell;
        } else {
          openCell = cell;
        }
      },
      cellDict : function() {
        return cellDict;
      },
      id : function() {
        return id;
      },
      totalNumRows : function() {
        return totalrows;
      },
      totalNumCols : function() {
        return totalcols;
      }
    }

    //recived comma separated string and inserts values into cells, expanding table if need be
    var importCsv = function(csvString) {
      closeCell(openCell);
      var rows = csvString.split('\n');
      if ((totalrows - rows.length) < 0) {
        returnObj.addRows(Math.abs(totalrows - rows.length));
      }
      if ((totalcols - rows[0].split(',').length) < 0) {
        returnObj.addColumns(Math.abs(totalcols - rows[0].split(',').length));
      }
      for (var row in rows) {
        var cells = rows[row].split(',');
        for (var col=0; col < cells.length; col++) {
          cellDict[numToCol(col+1)+(parseInt(row)+1)].contents(cells[col], true);
        }
      }
      
    }

    $('#slot'+String(slot)).html('<div id="'+id+'"></div>');
    $('#' + id).html(tableElem).css('height', window.screen.height*.4);

    //Apply callbacks
    if (spec.setCellContent) {
      if (typeof spec.setCellContent == 'function'){
          returnObj.setCellContent = spec.setCellContent;
      }else {
        console.log('setCellContent must be a function.')
      }
    }

    // Populate table data, if there is any
    if ( spec.init && typeof spec.init == 'function'){
      spec.init(returnObj);
    } else {
      if ('rows' in spec) {returnObj.addRows(spec.rows)} else {returnObj.addRows(1)};
      if ('columns' in spec) {returnObj.addColumns(spec.columns)} else {returnObj.addColumns(1)};
    }
    //returns public object
    tables.push(returnObj);
    return returnObj;
};


// HELPER FUNCTIONS

var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

var colToNum = function(str) {
  var num = 0;
  for (var i=0; i < str.length; i++) { 
    num += ( (alphabet.indexOf(str[i]) + 1) + (i*26) );
  }
  return num;
};

var numToCol = function (num) {
  var letter = '';
  var repeat = 0;
  var output = '';
  if (num < 27) {
    letter = alphabet[num - 1];
    output = letter;
  } else {
    if (num % 26 === 0) {
      letter = 'Z';
      repeat = Math.floor(num / 27) - 1;
    } else {
      letter = alphabet[(num % 26) - 1];
      repeat = Math.floor(num / 26)-1;
    }
    output = alphabet[repeat] + letter;
  }
  return output;
};

var closeCell = function(cell) {
  var elem = cell.elem();

  elem.empty();
  elem.append(cell.contents());
  elem.css('background-color', 'white');
};

function splitWordByPixelWidth(word, width) {
  if (context.measureText(word)<width) {
    return false
  }
  var charPerSlice = Math.ceil((word.length)/(context.measureText(word).width/width));
  outputList = [];
  for (var i = 0; i < Math.ceil(word.length/charPerSlice); i++) {
    outputList.push( word.slice( (i*charPerSlice), ((i*charPerSlice)+charPerSlice) ) );
  }
  return outputList;
}



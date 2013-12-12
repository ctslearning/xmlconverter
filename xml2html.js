var jsdom = require('jsdom').jsdom, 
    myWindow = jsdom().createWindow(), 
    $ = require('jquery').create(),
    jQuery = require('jquery').create(myWindow),
    fs = require('fs'),
    xml2js = require('xml2js');

var parser = new xml2js.Parser();
var args = process.argv.slice(2);
var xmlFile = args.shift();

if (typeof xmlFile == 'undefined') {
  console.log('Please specify an XML file in argument 1.' + "\n");
  console.log('USAGE: node xml2html.js input.xml output.html output2.html' + "\n");
  process.exit();
}

if (!args.length) {
  console.log('Please specify at least one HTML file to process.' + "\n");
  console.log('USAGE: node xml2html.js input.xml output.html output2.html' + "\n");
  process.exit();
}


readXML(xmlFile, function ($xml) {
  args.forEach(function (htmlFile, index, array) {
    readHTML(htmlFile, function ($html) {
      writeHTML(htmlFile, compileNewHTML($html, $xml));
    });
  });
});

function compileNewHTML($html, $xml) {
  var html = '<!DOCTYPE html>';
  $html = loadMorphs($html, $xml);
  $html.each(function () {
    if (typeof $(this).html() != 'undefined') {
      html += $(this).html();
    }
  });
  return html;
}

function loadMorphs($html, $xml) {
  //Each verse
  $html.find('.verse').each(function (verseIndex) {
    var $verse = $(this);
    // console.log($verse.attr('data-osis'));
    var $verseXML = $xml.find('verse[osisID="' + $verse.attr('data-osis') + '"]');
    // console.log($verseXML.attr('osisID'));

    //Each word
    $verse.find('span.w[data-lemma^="H"]').each(function (wordIndex) {
      var $word = $(this);
      // console.log($word.attr('data-lemma'));
      var $wordXML = $verseXML.find('w').filter(function(index) {
        return index == wordIndex;
      });
      // console.log($wordXML.attr('morph'));
      $word.attr('data-morph', $wordXML.attr('morph'));
    }); //end word
    
    // console.log($verse.html());
  }); //end verse
  
  console.log('Morphs applied.');
  
  return $html;
}


function readXML(file, callback) {
  fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
      console.log('An error has occurred!' + "\n");
      return console.log(err);
    }
    return parser.parseString(data, function (err, result) {
      console.log(file + ' loaded and parsed.');
      return callback($(data).find('div'));
    });
  });
}

function readHTML(file, callback) {
  fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
      console.log('An error has occurred!' + "\n");
      return console.log(err);
    }
    console.log(file + ' loaded and parsed.');
    return callback($(data));
  });
}

function writeHTML(file, data, callback) {
  fs.writeFile(file, data, function(err) {
    if(err) {
      console.log('An error has occurred!' + "\n");
      console.log(err);
    } else {
      console.log(file + " saved.");
    }
  }); 
}
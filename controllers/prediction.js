const asyncHandler = require('../middleware/async');
const exec = require('child_process').exec;
const fs = require('fs');
const util = require('util');
let exec_prom = util.promisify(exec);


// @desc      Render prediction page
// @route     GET /prediction/covid
// @access    Private
exports.renderCovidPrediction = asyncHandler(async (req, res, next) => {
    // req.body.point = req.params.pointId;

    res.render('covidImageUpload');
});


// @desc      POST from prediction page
// @route     POST /prediction/covid
// @access    Private
var predictionOutput = {};


exports.postCovidPrediction = asyncHandler(async (req, res, next) => {
    image = {
        data: req.body.image
    };

    var json = JSON.stringify(image);
    fs.writeFile('C:/Users/Saad Ur Rehman/Desktop/COVID19/covid-model-files/image_json_file.json', json, 'utf8', function (err) {
        if (err) {
            console.log(err);
        }
    });

    const pythonFilePath = '"C:/Users/Saad Ur Rehman/Desktop/COVID19/covid-model-files/model.py"';
    const imageFilePath = '"C:/Users/Saad Ur Rehman/Desktop/COVID19/covid-model-files/image_json_file.json"';

    var commands = [
        'conda activate covid-site',
        'python ' + pythonFilePath + ' --infile ' + imageFilePath
    ];

    // var pythonProcess = exec(commands.join(' & '),
    //     	 function(error, stdout, stderr){
    //        		// console.log(error);
    //         	console.log(stdout);
    //         	// console.log(stderr);
    //     }
    // );

    async function pythonScript() {
        // var pythonProcess = await exec_prom(commands.join(' & '),
        //     function (error, stdout, stderr) {
        //         // console.log(error);
        //         console.log(stdout);
        //         // this.stdin.end();
        //         // this.stdout.destroy();
        //         // this.stderr.destroy()

        //         // console.log(stderr);
        //         predictionOutput = JSON.parse(stdout);
        //         // res.redirect('/predictionCovid')
        //         // global.alert("Your result is "+predictionOutput.prediction);
        //         // res.render('covidPrediction', {prediction: 'hi', probability: 'bye'});
        //     }
        // );
        // pythonProcess.kill('SIGKILL');
        const {
            stdout
        } = await exec_prom(commands.join(' & '));
        predictionOutput = JSON.parse(stdout);

        // await conda.stdout.on('data', (data) => {
        //     predictionOutput = JSON.parse(data);
        //     console.log(predictionOutput);
        // });

        // await conda.on('close', (code) => {
        //     console.log(`child process exited with code ${code}`);
        // });

    }
    pythonScript().then(() => res.send({
        redirectTo: '/prediction/covidoutput'
    }));

    // res.send({
    //     redirectTo: '/prediction/covidoutput'
    // }).end();
    // res.redirect('covidPrediction');

    // res.redirect("/prediction/covidoutput");
    // pythonProcess.stdout.on('data', function(data) {

    // 	predictionOutput = JSON.parse(data);

    //   res.render('covidPrediction', {prediction: predictionOutput.prediction, probability: predictionOutput.probability})

    // });

    // pythonProcess.on('exit', function (code) {
    //     console.log("python process exited with code "+code);
    // });

    // res.render('covidPrediction', {prediction: 'hi', probability: 'bye'});
    // res.redirect('predictionCovid');
});

exports.renderCovidResultPage = asyncHandler(async (req, res, next) => {

    res.render('covidPrediction', {
        predictionOutput
    });
});
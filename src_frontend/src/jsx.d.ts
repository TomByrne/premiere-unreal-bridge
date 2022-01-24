declare namespace jsx {
  /**
   * [evalScript] For calling jsx scripts from the js engine
   *
   *         The jsx.evalScript method is used for calling jsx scripts directly from the js engine
   *         Allows for easy replacement i.e. variable insertions and for forcing eval.
   *         For convenience jsx.eval or jsx.script or jsx.evalscript can be used instead of calling jsx.evalScript
   *
   * @param  {String} jsxScript
   *                            The string that makes up the jsx script
   *                            it can contain a simple template like syntax for replacements
   *                            'alert("__foo__");'
   *                            the __foo__ will be replaced as per the replacements parameter
   *
   * @param  {Function} callback
   *                            The callback function you want the jsx script to trigger on completion
   *                            The result of the jsx script is passed as the argument to that function
   *                            The function can exist in some other file.
   *                            Note that InDesign does not automatically pass the callBack as a string.
   *                            Either write your InDesign in a way that it returns a sting the form of
   *                            return 'this is my result surrounded by quotes'
   *                            or use the force eval option
   *                            [Optional DEFAULT no callBack]
   *
   * @param  {Object} replacements
   *                            The replacements to make on the jsx script
   *                            given the following script (template)
   *                            'alert("__message__: " + __val__);'
   *                            and we want to change the script to
   *                            'alert("I was born in the year: " + 1234);'
   *                            we would pass the following object
   *                            {"message": 'I was born in the year', "val": 1234}
   *                            or if not using reserved words like do we can leave out the key quotes
   *                            {message: 'I was born in the year', val: 1234}
   *                            [Optional DEFAULT no replacements]
   *
   * @param  {Boolean} forceEval
   *                             If the script should be wrapped in an eval and try catch
   *                             This will 1) provide useful error feedback if heaven forbid it is needed
   *                             2) The result will be a string which is required for callback results in InDesign
   *                             [Optional DEFAULT true]
   *
   * Note 1) The order of the parameters is irrelevant
   * Note 2) One can pass the arguments as an object if desired
   *         jsx.evalScript(myCallBackFunction, 'alert("__myMessage__");', true);
   *         is the same as
   *         jsx.evalScript({
   *             script: 'alert("__myMessage__");',
   *             replacements: {myMessage: 'Hi there'},
   *             callBack: myCallBackFunction,
   *             eval: true
   *         });
   *         note that either lower or camelCase key names are valid
   *         i.e. both callback or callBack will work
   *
   *      The following keys are the same jsx || script || jsxScript || jsxscript || file
   *      The following keys are the same callBack || callback
   *      The following keys are the same replacements || replace
   *      The following keys are the same eval || forceEval || forceeval
   *      The following keys are the same forceEvalScript || forceevalscript || evalScript || evalscript;
   *
   * @return {Boolean} if the jsxScript was executed or not
   */
  declare function evalScript(
    script: string,
    callback?: (res: string) => void,
    replacements?: Record<string, unknown>,
    forceEval?: boolean
  ): boolean;

  /**
   * [evalFile] For calling jsx scripts from the js engine
   *
   *         The jsx.evalFiles method is used for executing saved jsx scripts
   *         where the jsxScript parameter is a string of the jsx scripts file location.
   *         For convenience jsx.file or jsx.evalfile can be used instead of jsx.evalFile
   *
   * @param  {String} file
   *                            The path to jsx script
   *                            If only the base name is provided then the path will be presumed to be the
   *                            To execute files stored in the jsx folder located in the __dirname folder use
   *                            jsx.evalFile('myFabJsxScript.jsx');
   *                            To execute files stored in the a folder myFabScripts located in the __dirname folder use
   *                            jsx.evalFile('./myFabScripts/myFabJsxScript.jsx');
   *                            To execute files stored in the a folder myFabScripts located at an absolute url use
   *                            jsx.evalFile('/Path/to/my/FabJsxScript.jsx'); (mac)
   *                            or jsx.evalFile('C:Path/to/my/FabJsxScript.jsx'); (windows)
   *
   * @param  {Function} callback
   *                            The callback function you want the jsx script to trigger on completion
   *                            The result of the jsx script is passed as the argument to that function
   *                            The function can exist in some other file.
   *                            Note that InDesign does not automatically pass the callBack as a string.
   *                            Either write your InDesign in a way that it returns a sting the form of
   *                            return 'this is my result surrounded by quotes'
   *                            or use the force eval option
   *                            [Optional DEFAULT no callBack]
   *
   * @param  {Object} replacements
   *                            The replacements to make on the jsx script
   *                            give the following script (template)
   *                            'alert("__message__: " + __val__);'
   *                            and we want to change the script to
   *                            'alert("I was born in the year: " + 1234);'
   *                            we would pass the following object
   *                            {"message": 'I was born in the year', "val": 1234}
   *                            or if not using reserved words like do we can leave out the key quotes
   *                            {message: 'I was born in the year', val: 1234}
   *                            By default when possible the forceEvalScript will be set to true
   *                            The forceEvalScript option cannot be true when there are replacements
   *                            To force the forceEvalScript to be false you can send a blank set of replacements
   *                            jsx.evalFile('myFabScript.jsx', {}); Will NOT be executed using the $.evalScript method
   *                            jsx.evalFile('myFabScript.jsx'); Will YES be executed using the $.evalScript method
   *                            see the forceEvalScript parameter for details on this
   *                            [Optional DEFAULT no replacements]
   *
   * @param  {Boolean} forceEval
   *                             If the script should be wrapped in an eval and try catch
   *                             This will 1) provide useful error feedback if heaven forbid it is needed
   *                             2) The result will be a string which is required for callback results in InDesign
   *                             [Optional DEFAULT true]
   *
   *                             If no replacements are needed then the jsx script is be executed by using the $.evalFile method
   *                             This exposes the true value of the $.fileName property <span class="wp-font-emots-emo-sunglasses"></span>
   *                             In such a case it's best to avoid using the $.__fileName() with no base name as it won't work
   *                             BUT one can still use the $.__fileName('baseName') method which is more accurate than the standard $.fileName property <span class="wp-font-emots-emo-happy"></span>
   *                             Let's say you have a Drive called "Graphics" AND YOU HAVE a root folder on your "main" drive called "Graphics"
   *                             You call a script jsx.evalFile('/Volumes/Graphics/myFabScript.jsx');
   *                             $.fileName will give you '/Graphics/myFabScript.jsx' which is wrong
   *                             $.__fileName('myFabScript.jsx') will give you '/Volumes/Graphics/myFabScript.jsx' which is correct
   *                             $.__fileName() will not give you a reliable result
   *                             Note that if your calling multiple versions of myFabScript.jsx stored in multiple folders then you can get stuffed!
   *                             i.e. if the fileName is important to you then don't do that.
   *                             It also will force the result of the jsx file as a string which is particularly useful for InDesign callBacks
   *
   * Note 1) The order of the parameters is irrelevant
   * Note 2) One can pass the arguments as an object if desired
   *         jsx.evalScript(myCallBackFunction, 'alert("__myMessage__");', true);
   *         is the same as
   *         jsx.evalScript({
   *             script: 'alert("__myMessage__");',
   *             replacements: {myMessage: 'Hi there'},
   *             callBack: myCallBackFunction,
   *             eval: false,
   *         });
   *         note that either lower or camelCase key names or valid
   *         i.e. both callback or callBack will work
   *
   *      The following keys are the same file || jsx || script || jsxScript || jsxscript
   *      The following keys are the same callBack || callback
   *      The following keys are the same replacements || replace
   *      The following keys are the same eval || forceEval || forceeval
   *
   * @return {Boolean} if the jsxScript was executed or not
   */
  declare function evalFile(
    file: string,
    callback?: (res: string) => void,
    replacements?: Record<string, unknown>,
    forceEval?: boolean
  ): boolean;
}

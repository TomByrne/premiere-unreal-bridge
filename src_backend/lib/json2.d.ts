interface JSON {

    /**
     * The JSON.stringify() method converts a JavaScript object or value to a JSON string, optionally
     * replacing values if a replacer function is specified or optionally including only the specified
     * properties if a replacer array is specified.
     */
    stringify(obj:unknown, replacer?:unknown, space?:string): string | undefined
  
    /**
     * The JSON.parse() method parses a JSON string, constructing the JavaScript value or object described by the string.
     */
    parse<T>(str: string) : T
  }
  declare const JSON: JSON
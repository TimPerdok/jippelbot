import Option from "../classes/Option"


export default class Subcommand {

    name: string
    description: string
    options: Option[] = [
    ]



    constructor(name: string, description: string, options: Option[] = []) {
        this.name = name
        this.description = description
        this.options = options
    }



}

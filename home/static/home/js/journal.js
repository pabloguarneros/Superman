class Journal extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            loaded:false,
            toggle:"write",
            current_entry: "",
            past_entries: [],
            keywords: [],
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleToggleRead = this.handleToggleRead.bind(this);
        this.handleToggleBrowse = this.handleToggleBrowse.bind(this);
        this.handleToggleWrite = this.handleToggleWrite.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFetchArticle = this.handleFetchArticle.bind(this);
    };


    componentDidMount(){
        const keywords = "/journal/api/keywords";
        fetch(keywords)
            .then((response) => response.json())
            .then ((data) => 
                this.setState(({
                    keywords: data,
                    loaded:true,
                }))
            );        
    };

    render() {
        if (this.state.loaded){
            if (this.state.toggle=="read"){
                return this.renderReadEntries();
            } else if (this.state.toggle=="browse"){
                return this.renderBrowseJournal();
            } else if (this.state.toggle=="write"){
                return this.renderAddEntry();
            } else{
                console.log("There is a problem.")
                return null
            }
        } else {
            return null
        };
    }

    renderAddEntry(){
        return(
            <div id="add_new_entry" className="ac fc h_cent">
                <label className="ac fc">
                    <small className="tt_cent"> Create Or Paste An Entry </small> 
                    <textarea value={this.state.current_entry} name="current_entry" onChange={this.handleChange} />
                </label>
                <div className="new_contact_BTNs fr ac">
                    <button onClick={this.handleSubmit}>
                        Submit Entry
                    </button>
                    <button onClick={this.handleToggleBrowse}>
                        Browse Journal
                    </button>
                </div>
                <div id="journal_added_message"></div>
            </div>
        )
    }

    renderBrowseJournal(){
        return(
            <div id="friend_list" className="ac fc h_cent">
                    <div className="keyword_labels fc">
                        <small className="tt_cent"> Click To Load Entries </small> 
                        <small className="tt_cent"> <i>psst... these are the words you use most often </i> </small>
                    </div>
                    <div id="keyword_map" className="fr">
                        {this.state.keywords.map((value) => {
                        return <div>
                            <button name={value["word"]} onClick={this.handleFetchArticle}>{value["word"]}</button>
                        </div>
                        })}
                    </div>
                    <button onClick={this.handleToggleWrite}>
                        Go Back To Writing
                    </button>
            </div>
        )
    }

    renderReadEntries(){
        return(
            <div id="journal_container" className="ac fc h_cent">
                <div id="entry_review" className="fc ac">
                    {this.state.past_entries.map((value) => {
                    return <div className="single_entry fc">
                        <small>Entry for {value["created"]}</small>
                        <small> Smart Summary: </small>
                        <small>
                        {(value["sentimentality_score"] < -0.3) && <small> Overall, the tone is very negative </small>}
                        {(value["sentimentality_score"] >= -0.3 & value["sentimentality_score"] < -0.05) && <small>Overall, the tone is slightly negative </small>}
                        {(value["sentimentality_score"] >= -0.05 & value["sentimentality_score"] < 0.05) && <small>Overall, the tone is neutral </small>}
                        {(value["sentimentality_score"] >= 0.05 & value["sentimentality_score"] < 0.3) && <small> Overall, the tone is slightly positive </small>}
                        {(value["sentimentality_score"] >= 0.3) && <small>Overall, the tone is very positive </small>}
                        </small>
                        <small>Descriptive Score: {value["descriptive_score"]}</small>
                        <div><p>{value["text"]}</p></div>
                        <div className="entry_div"></div>
                    </div>
                    })}
                    <div className="fr ac">
                        <button onClick={this.handleToggleWrite}>
                            Go Back To Writing
                        </button>
                        <button onClick={this.handleToggleBrowse}>
                            Browse Journal
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    handleChange(event) {
        const target = event.target;
        const name = target.name;
        this.setState({
            [name]: target.value
        });
      } 

    handleFetchArticle(event){
        event.preventDefault();
        const obj = this;
        const name = event.target.name;
        var url = `/journal/api/wordentry?&word=${name}`
        fetch(url)
            .then((response) => response.json())
            .then ((data) => 
                obj.setState(({
                    past_entries: data,
                    toggle:"read"
                }))
            ); 
        
    }

    handleSubmit(event) {
        event.preventDefault();
        const obj = this;
        const current_entry = this.state.current_entry;
        $.ajaxSetup({ 
            beforeSend: function(xhr, settings) {
                function getCookie(name) {
                    var cookieValue = null;
                    if (document.cookie && document.cookie != '') {
                        var cookies = document.cookie.split(';');
                        for (var i = 0; i < cookies.length; i++) {
                            var cookie = jQuery.trim(cookies[i]);
                            // Does this cookie string begin with the name we want?
                            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                                break;
                            }
                        }
                    }
                    return cookieValue;
                }
                if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                    // Only send the token to relative URLs i.e. locally.
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                }
            } 
        });
        $.ajax( 
        { 
            url: `/journal/add_entry`,
            type:"POST", 
            data:{ 
                entry_body: current_entry
                }, 
        
        success: function() {
            obj.setState(state => ({
                current_entry: ""
            }))
            $("#journal_added_message")[0].appendChild(document.createTextNode("Entry Added."));
        }
    });
      }
    
    // following toggles should be resolved with only one call
    handleToggleWrite = () => {
        this.setState(state => ({
            toggle: "write"
        }))}

    handleToggleBrowse = () => {
        this.setState(state => ({
            toggle:"browse"
        }))}

    handleToggleRead = () => {
        this.setState(state => ({
            toggle: "read"
        }))}

}

ReactDOM.render(<Journal />, document.querySelector("#journal_manager"));
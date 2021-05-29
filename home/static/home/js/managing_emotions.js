class MoodManager extends React.Component {
    

    constructor(props) {
        super(props);

        this.state = {
            loaded:false,
            toggle: false,
            past_emotions: [],
        };

        this.handleToggle = this.handleToggleOn.bind(this);
        this.handleToggle = this.handleToggleOff.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    };


    componentDidMount(){
        // const tag_api = "http://127.0.0.1:8000/search/api/tag";
        const emotion_api = "/api/emotions";
        fetch(emotion_api)
            .then((response) => response.json())
            .then ((data) => 
                this.setState(({
                    past_emotions: data,
                    loaded:true,
                }))
            );
        
    };

    render() {
        if (this.state.loaded == false){
            return null
        } else if (this.state.toggle == true){
            return this.renderEmotionSchedule();
        } else{
                return this.renderAddEmotion();
            };
    }

    renderEmotionSchedule(){
        return(
            <div className="ac fc h_cent">
                    <h4 className="tt_cent"> Your Past Emotions </h4>
                    <div id="mood_filter" className="closed_filter">
                        {this.state.past_emotions.map((item) => {
                            return <div className="fc ac">
                                <p>
                                {(item["emotion"] == 0) && <div name={item} role="img">😍<small name={item}></small></div>}
                                {(item["emotion"] == 1) && <div name={item} role="img">🙂<small name={item}></small></div>}
                                {(item["emotion"] == 2) && <div name={item} role="img">😐<small name={item}></small></div>}
                                {(item["emotion"] == 3) && <div name={item} role="img">😟<small name={item}></small></div>}
                                {(item["emotion"] == 4) && <div name={item} role="img">😭<small name={item}></small></div>}
                                </p>
                                <small> <i>{item["time_felt"]}</i></small>
                            </div>
                        })}
                    </div>
                    <button class="toggle_BTN" onClick={this.handleToggleOff}>
                        Add New Emotion
                    </button>
            </div>
        )
    }

    renderAddEmotion(){
        return(
            <div id="mood_tracker_div" className="ac fc h_cent">
                <h4 className="tt_cent"> Track Your Mood </h4>
                <div className="mood_choices fc ac">
                    <button value='0' onClick={this.handleSubmit}>
                        <div value='0' role="img"><p>😍</p><small value='0'>ecstatic</small></div>
                    </button>
                    <button value='1' onClick={this.handleSubmit}>
                        <div value='1' role="img"><p>🙂</p><small value='1'>joyful</small></div>
                    </button>
                    <button value='2' onClick={this.handleSubmit}>
                        <div value='2' role="img"><p>😐</p><small value='2'>fine</small></div>
                    </button>
                    <button value='3' onClick={this.handleSubmit}>
                        <div value='3' role="img"><p>😟</p><small value='3'>sad</small></div>
                    </button>
                    <button value='4' onClick={this.handleSubmit}>
                        <div value='4' role="img"><p>😭</p><small value='4'>super sad</small></div>
                    </button>
                </div>
                <button className="toggle_BTN" onClick={this.handleToggleOn}>
                    See Previous Emotions
                </button>
                <div id="emotion_added_message"></div>
            </div>
        )
    }

    handleSubmit(event) {
        event.preventDefault();
        const emotion = event.currentTarget.value;
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
            url: `/users/done_emotion`,
            type:"POST", 
            data:{ 
                emotion: emotion,
                }, 
        
        success: function() {
            $("#mood_tracker_div")[0].appendChild(document.createTextNode("Emotion Added. Thanks for opening up."));
        }
    });

      }
   
    handleToggleOff = () => {
        this.setState(state => ({
            toggle: false,
        }))}

    handleToggleOn = () => {
        this.setState(state => ({
            toggle: true,
        }))}

}

ReactDOM.render(<MoodManager />, document.querySelector("#mood_manager"));
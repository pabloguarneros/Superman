class Checklist extends React.Component {
    

    constructor(props) {
        super(props);

        this.state = {
            scene: 0,
            loaded:false,
            activity: [], 
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleNext = this.handleNext.bind(this);

    };


    componentDidMount(){
        const activity_api = "/api/activities";
        fetch(activity_api)
            .then((response) => response.json())
            .then ((data) => 
                this.setState({
                    activity: data,
                    loaded: true
                })
            );
        
    };

    render() {
        if (this.state.loaded){
            return(
            <div id="scene1" className="ac fc cent">
                <div className="fr">
                    {this.state.activity.slice(0,1).map((item) => {
                                return <div>
                                    <p> {item["description"]} </p>    
                                    <small> Do it to get {item["manly_points"]} Manly Points! </small>                 
                    <button id="done_btn" className="Done" value={item["pk"]} onClick={this.handleSubmit}>
                        Done
                    </button>
                    {this.state.activity.length > 1 &&
                    <button onClick={this.handleNext}>
                        See Next
                    </button>
                    }
                </div>
                })}
             </div>
            </div>
            )}
        else{
            return null
        }
        }

    handleNext(event) {
            this.setState({
                activity: this.state.activity.slice(1,2)
            })
        }


    handleSubmit(event) {
        event.preventDefault();
        const activity_id = event.target.value;
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
            url: '/users/done_activity',
            type:"POST", 
            data:{ 
                activity:activity_id,
                }, 
        
        success: function() {
            $("#done_btn").replaceWith("<div><h2> Awesomely! </h2></div>");
            
        }
    });

      }

}

/* $(function(){
    "#can we fetch the user by just loading their object into serializer?! ooo"
    fetch(`search/load/?&query=&start=0&end=10&country=${req.user.country.name}`)
    .then(response => response.json())
    .then(data => {
        films = data["posts"];
    });
});   */
ReactDOM.render(<Checklist />, document.querySelector("#done_activity"));
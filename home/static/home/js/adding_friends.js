class FriendManager extends React.Component {
    

    constructor(props) {
        super(props);

        this.state = {
            loaded:false,
            toggle: false,
            friends: [],
            new_friend_name: "",
            new_friend_social: "",
            new_friend_phone: "",
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleToggle = this.handleToggleOn.bind(this);
        this.handleToggle = this.handleToggleOff.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    };


    componentDidMount(){
        // const tag_api = "http://127.0.0.1:8000/search/api/tag";
        const friend_api = "/api/friends";
        fetch(friend_api)
            .then((response) => response.json())
            .then ((data) => 
                this.setState(({
                    friends: data,
                    loaded:true,
                }))
            );
        
    };

    render() {
        if (this.state.loaded){
            if (this.state.toggle == true){
                return this.renderAddFriends();
            } else{
                return this.renderFriendList();
            }
        } else {
            return null
        };
    }

    renderFriendList(){
        return(
            <div id="friend_list" className="ac fc h_cent">
                    <h4> Your Support Network </h4>
                    <div id="support_network">
                        {this.state.friends.map((value) => {
                            var name = value["name"];
                        return <div className="one_friend fc ac">
                            <p><b>{value["name"]}</b></p>
                            <a href={value["social_media_link"]} target="_blank">Message</a>
                        </div>
                        })}
                    </div>
                    <button class="toggle_BTN" onClick={this.handleToggleOn}>
                        Add Contacts
                    </button>
            </div>
        )
    }

    renderAddFriends(){
        return(
            <div id="add_new_contact" className="ac fc h_cent">
                <h4> Add A Contact </h4>
                <label>
                    <p className="cent"> Person's Name </p>
                    <input value={this.state.new_friend_name} name="new_friend_name" onChange={this.handleChange} />
                </label>
                <label>
                    <p> URL Link To Their Social Media </p>
                    <input value={this.state.new_friend_social} name="new_friend_social" onChange={this.handleChange} />
                </label>
                <div className="new_contact_BTNs fc ac">
                    <button className="next_BTN" onClick={this.handleSubmit}>
                        Add Friend
                    </button>
                    <button className="toggle_BTN" onClick={this.handleToggleOff}>
                        Go Back
                    </button>
                </div>
                <p id="friend_added_message"></p>
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

    handleSubmit(event) {
        event.preventDefault();
        const obj = this;
        const friend_name = this.state.new_friend_name;
        const new_friend_social = this.state.new_friend_social;
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
            url: `/users/done_friend`,
            type:"POST", 
            data:{ 
                name: friend_name,
                social: new_friend_social
                }, 
        
        success: function() {
            obj.setState(state => ({
                new_friend_name: "",
                new_friend_social: ""
            }))

            $("#add_new_contact")[0].appendChild(document.createTextNode("Contact Added"));
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

ReactDOM.render(<FriendManager />, document.querySelector("#friend_manager"));
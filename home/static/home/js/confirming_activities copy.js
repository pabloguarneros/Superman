class Checklist extends React.Component {
    

    constructor(props) {
        super(props);

        this.state = {
            scene: 0,
            loaded:false,
            activity: [], 
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    };


    componentDidMount(){
        const activity_api = "/search/api/tag";
        fetch(tag_api)
            .then((response) => response.json())
            .then ((data) => 
                this.setState(({
                    tags: data
                }))
            );
        
    };

    render() {
        if (this.state.scene == 0){
            return this.renderCreate();
        }
        else if (this.state.scene == 1){
            return this.renderTitle();
            //tags to help you select movies in next step
        }
        else if (this.state.scene == 2){
            return this.renderTag();
        }
        else if (this.state.scene == 3){
            //two borders, either add from search or select from suggestions
            return this.renderAddFilms();
        }
        else if (this.state.scene == 4){
            //submit all
            return this.renderAddMeta();
        };
    }

    renderCreate(){
        return(
            <div id="scene1" className="ac fc cent">
                <button id="collection_start" className="cent" onClick={this.nextBTN}>
                    Create New Collection
                </button>
            </div>
        )
    }

    renderTitle(){
        return(
            <div id="scene2" className="ac fc cent">
                <h2> Name Your Collection </h2>
                <div className="fr">
                    <label>
                        <input type="text" value={this.state.name} name="name" onChange={this.handleChange} />
                    </label>
                </div>
                <button className="next_BTN" onClick={this.nextBTN}>
                    Next
                </button>
            </div>
        )
    }

    renderTag(){
        $(document).ready(function() {
            $('#tag_select').select2();
        });
        return(
            <div id="scene3" className="ac fc cent">
                    <h2> Tag It </h2>
                    <label>
                    <select id="tag_select" className="form-group" multiple={true} value={this.state.tag_select} onChange={this.handleTags}>
                        {this.state.tags.map((value, index) => {
                            var name = this.state.tags[index]["name"];
                        return <option value={name}>{name}</option>
                        })}
                    </select>
                    </label>
                <button class="next_BTN" onClick={this.handleTags}>
                    Next
                </button>
            </div>
        )

    }

    handleTags = () => {
        let value = Array.from($(".select2-selection__rendered li"), option => option.title);
        this.setState({
            tag_select: value
        });
        this.nextBTN();
      }

    handleFilmLoad(){
        const tags = this.state.tag_select;
        // var url = "http://127.0.0.1:8000/search/api/film_by_tag?&tag="

        var url = "/search/api/film_by_tag?&tag="
        for (var i=0; i < tags.length; i++){
            if (i == 0){
                url = url.concat("",tags[i])
            }else{
                url = url.concat(",",tags[i])
            }
        };
        const fetchFilm = async () => {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    var easy_f = [];
                    for (var i = 0; i < data.length; i++){
                        const movie_ID = data[i]["movie_ID"];
                        const image = new Image().src=data[i]["poster_pic"];
                        easy_f.push([movie_ID,image]);
                        };
                    this.setState({
                        easy_f: easy_f,
                        loaded:true
                        })
                });
        };
        fetchFilm();
    }

    handleSearchChange(event){
        const value = event.target.value;
        this.setState({
            search_value: value,
        },this.getFilms(value));


    }

    getFilms(value) {
        // var url = `http://127.0.0.1:8000/search/api/film_by_tag?&tt=${value}`
        var url = `/search/api/film_by_tag?&tt=${value}`
        var searched_films = []
        const fetchSearch = async () => {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    searched_films = [];
                    for (var i = 0; i < data.length; i++){
                        const movie_ID = data[i]["movie_ID"];
                        const image = new Image().src=data[i]["poster_pic"];
                        searched_films.push([movie_ID,image]);
                        };
                    this.setState({
                            searched_films: searched_films
                        });
                });
        };
        fetchSearch();
      } 
    
      handleAdd = (event) => {{
          const movie_ID = event.target.getAttribute("value");
          const poster = event.target.getAttribute("src");
          var on_coll = this.state.on_coll;
          var if_contains = on_coll.every((element,index,array)=>{
                return array[index][0] != movie_ID;
                });
          if (if_contains){
            on_coll.push([movie_ID,poster]);
                this.setState({
                on_coll: on_coll,
                });
                $(`.movie_search_${movie_ID}`).css("filter","brightness(0%)");
            }
    }}

      handleRem = (event) => {{
        const movie_ID = event.target.getAttribute("value");
        var array = this.state.on_coll;
        var filtered = array.filter(function(value, index, array){ 
            return value[0] != movie_ID;
            });
        this.setState({
            on_coll: filtered,
            });
        $(`.movie_search_${movie_ID}`).css("filter","brightness(100%)");
    }}

    handlePrivacy(selectedOption) {
        this.setState({
            privacy: selectedOption.target.value
        });
      }

    renderAddFilms(){
        if (this.state.loaded == false){
            this.handleFilmLoad();
        };
        if (this.state)
        return( // WHY DOES IT KEEP GOING ON AND ON AND ON AND ON
            <div id="scene4" className="ac fc cent">
                <h2> Add Films </h2>
                <small> You can always add + later! </small>
                <div id="search_col" className="fc cent">
                    {this.state.easy_f.length > 0 && //if statement renders if the result can be mapped
                    <div id="l_search" className="fc ac cent">
                        <small className="border_label"> Easy Select </small>
                        <div id="suggested_gall" className="fr">
                        {this.state.easy_f.map((item) => {
                            let movie_class = "movie_search_".concat(item[0])
                            return <div>
                                <a className={movie_class} onClick={this.handleAdd}>
                                    <img value={item[0]} src={item[1]} alt="Poster Picture"/>
                                </a>
                            </div>
                        })}
                        </div>
                    </div>
                    } 
                    <div id="r_search" className="fc ac cent">
                        <small className="border_label"> Search </small>
                        <input type="text" value={this.state.search_value} onChange={this.handleSearchChange}></input>
                            <div id="searched_gall" className="fr">
                                {this.state.searched_films.map((item) => {
                                    let movie_class = "movie_search_".concat(item[0])
                                    return <div>
                                        <a className={movie_class} onClick={this.handleAdd}>
                                            <img value={item[0]} src={item[1]} alt="Poster Picture"/>
                                        </a>
                                    </div>
                                })}
                            </div>
                        </div>
                    </div>
                <div id="selected_ff" className="fc cent ac">
                        
                        {this.state.on_coll.length >0 && <small className="border_label"> Selected </small>}
                        <div id="selected_gall" className="fr">
                        {this.state.on_coll.map((item) => {
                            return <div>
                                <a onClick={this.handleRem}>
                                    <img value={item[0]} src={item[1]} alt="Poster Picture"/>
                                </a>
                            </div>
                        })}
                        </div>
                    </div>
                <button class="next_BTN" onClick={this.nextBTN}>
                    Next
                </button>
            </div>
        )
    }

    renderAddMeta(){
        return(
            <div id="scene5" className="ac fc cent">
                <h2> Anything extra you want to add? </h2>
                <label>
                    <p className="cent"> Collection Description </p>
                    <textarea value={this.state.value} name="description" onChange={this.handleChange} />
                </label>
                <label id="privacy_settings">
                    <p> Privacy Settings </p>
                    <select id="privacy_select" className="form-group" value={this.state.privacy} onChange={this.handlePrivacy}>
                        <option value={1}>Public</option>
                        <option value={2}>Only Friends</option>
                        <option value={0}>Private</option>
                    </select>
                </label>
                <button class="next_BTN" onClick={this.handleSubmit}>
                    Done
                </button>
            </div>
        )
    }

    /* if ever need to do review
    renderSubmit(){
        return(
            <div id="scene6" className="ac fc cent">
                <button onClick={this.handleSubmit}>
                    You are gucci to go
                </button>
            </div>
        );
    }
    */

    handleChange(event) {
        const target = event.target;
        const name = target.name;
        this.setState({
            [name]: target.value
        });
      } 

    handleSubmit(event) {
        event.preventDefault();
        var movie_IDs = this.state.on_coll.map(element=>element[0]);
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
            url: `/tribe/create_collection`,
            type:"POST", 
            data:{ 
                name:this.state.name,
                movie_ID:movie_IDs,
                description:this.state.description,
                tags:this.state.tag_select,
                privacy:this.state.privacy,
                }, 
        
        success: function() {
            $("#create_collection").replaceWith("<div><h2> Awesomely! We got your collection! </h2></div>");
        }
    });

      }
   
    nextBTN = () => {
        this.setState(state => ({
            scene: state.scene +1,
            loaded: false,
        }))
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
ReactDOM.render(<Collections />, document.querySelector("#create_collection"));
jQuery.githubUser = function (username, callback) {
    jQuery.getJSON('https://api.github.com/orgs/' + username + '/repos?callback=?', callback);
};

jQuery.fn.loadRepositories = function (username) {

    var repoSection = document.getElementById('repo-section');
    
    this.html("<div class='query-class'><span>Querying GitHub for " + username + "'s repositories...</span></div>");

    var target = this;
    $.githubUser(username, function (data) {
        var meta = data.meta;
        var repos = data.data; // JSON Parsing

        target.empty();
        if (meta.status == 200) {

            repoSection.innerHTML = ''; //clear the repo section
            populateOasSections();

            var oas3repoDOM = document.getElementById('oas3-repos'); //get DOM element for OAS3 repos
            var oas2repoDOM = document.getElementById('oas2-repos'); //get DOM element for OAS3 repos

            var specArr = splitReposBySpec(repos); //split repos by spec
            populateRepoContainer(specArr.oas3repos, oas3repoDOM); // populate oas3repos in DOM
            sortByName(specArr.oas2repos);
            populateRepoContainer(specArr.oas2repos, oas2repoDOM); // populate oas3repos in DOM

        } else {
            repoSection.innerHTML = '';

            var notificationTemplate = `<div
                class="bx--inline-notification bx--inline-notification--warning bx--inline-notification--low-contrast repo-section__notification">
                <div class="bx--inline-notification__details">
                    <svg focusable="false" preserveAspectRatio="xMidYMid meet" style="will-change: transform;"
                        xmlns="http://www.w3.org/2000/svg" class="bx--inline-notification__icon" width="20" height="20"
                        viewBox="0 0 20 20" aria-hidden="true">
                        <path
                            d="M10,1c-5,0-9,4-9,9s4,9,9,9s9-4,9-9S15,1,10,1z M9.2,5h1.5v7H9.2V5z M10,16c-0.6,0-1-0.4-1-1s0.4-1,1-1	s1,0.4,1,1S10.6,16,10,16z">
                        </path>
                        <path d="M9.2,5h1.5v7H9.2V5z M10,16c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S10.6,16,10,16z"
                            data-icon-path="inner-path" opacity="0"></path>
                    </svg>
                    <div class="bx--inline-notification__text-wrapper">
                        <p class="bx--inline-notification__title">Unable to retrieve repositories</p>
                        <p class="bx--inline-notification__subtitle">No problem though, follow the link.</p>
                    </div>
                </div>
                <a href="https://github.com/zosconnect" style="margin-right: 1rem;">
                    <button tabindex="0"
                        class="bx--inline-notification__action-button bx--btn bx--btn--sm bx--btn--ghost"
                        type="button">Please click here</button>
                </a>
            </div>`
            repoSection.insertAdjacentHTML('beforeend', notificationTemplate);
        }
    });

    function populateOasSections() {
        var template = `<!-- OpenAPI 3 repositories -->
        <div class="repo-section__container">
            <h2 class="repo-section__title">OpenAPI 3 repositories</h2>
            <div id="oas3-repos" class="repo-section__repositories-container">
            </div>
        </div>
        <!-- OpenAPI 2 repositories -->
        <div class="repo-section__container">
            <h2 class="repo-section__title">OpenAPI 2 repositories</h2>
            <div id="oas2-repos" class="repo-section__repositories-container">
            </div>
        </div>`;
        repoSection.insertAdjacentHTML('beforeend', template);
    }

    // function to create the container for OAS3 repos
    function populateRepoContainer(arr, DOMElement) {
        var StringArr = [];
        arr.forEach(function(repo) {
            var repo = `<a href="${repo.html_url}" target="_blank" class="repo-section__repo">
                <div class="repo-section__information">
                    <div class="repo-section__repo-git-icon">
                        <img src="./imgs/logo--github.svg" alt="GitHub Icon">
                    </div>
                    <div class="repo-section__repo-name">
                        ${repo.name}
                    </div>
                    <div class="repo-section__repo-description">
                        ${displayDescription(repo.description)}
                    </div>
                </div>

                <div class="repo-section__repo-launch-icon">
                    <img src="./imgs/arrow--up-right.svg" alt="Launch Repo">
                </div>
            </a>`;
            StringArr.push(repo);
        });
        // console.log(StringArr);
        DOMElement.insertAdjacentHTML('beforeend', StringArr.join(""));
    }

    function displayDescription(description) {
        if(description === null) {
            return '';
        }
        return description;
    }

    // function to sort repos by oas3 or oas2 support sample
    function splitReposBySpec(repositories) {
        var oas3repos = []; //declare empty oas3 repos array
        var oas2repos = []; //declare empty oas2 repos array

        //iterate over repos array and remove oas3 entries into another array
        repositories.forEach(function(repo) {
            // console.log(repo); //print to console

            if(repo.id === 429458443) { // Db2 sample unique ID = 429458443
                oas3repos.push(repo); //remove openapi 3 repos from the array received
                return;
            }
            oas2repos.push(repo);
            return;
        });

        return {
            oas3repos: oas3repos, //return array without oas3 project
            oas2repos: oas2repos //return array with oas2 repos sorted by name
        };
    }

    //function to sort repositories alphabetrically
    function sortByName(repos) {
        repos.sort(function (a, b) {
            return a.name - b.name;
        });
    }

};
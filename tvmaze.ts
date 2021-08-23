import axios from "axios"
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const DEFAULT_IMAGE = "https://static.tvmaze.com/images/no-img/no-img-portrait-text.png";
const BASE_URL = "https://api.tvmaze.com";

interface Show {
  id: string;
  name: string;
  summary: string;
  image: string;
}

interface Episode {
  id: string;
  name: string;
  season: string;
  number: string;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<Show[]> {
  let response = await axios.get(`${BASE_URL}/search/shows?q=${term}`);
  return response.data.map((show: any) => ({
    id: show.show.id,
    name: show.show.name,
    summary: show.show.summary,
    image: show.show.image !== null ? show.show.image.medium : DEFAULT_IMAGE
  }));
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: Show[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term: string = String($("#searchForm-term").val());
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
 async function getEpisodesOfShow(id: string): Promise<Episode[]>{ 
  let url: string = BASE_URL + `/shows/${id}/episodes`;
  let response = await axios.get(url);
  return response.data;
}

/** Given an array of episodes, populate each episode into the DOM */

function populateEpisodes(episodes: Episode[]): void { 

  $episodesList.empty();
  for (let episode of episodes) {
    let { name, season, number } = episode;
    const $episode = $(`<li>${name} (season ${season}, number ${number})</li>`);
    $episodesList.append($episode);
  }
  $episodesArea.show();
}

/** Get episodes from API using show id from evt target and adds them
 *  to the DOM
 */
 async function searchforEpisodesAndDisplay(evt: JQuery.ClickEvent): Promise<void> {

  const $button = $(evt.target);
  const id = $button.closest('.Show').data('show-id');
  const episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
}

$showsList.on("click", "button", searchforEpisodesAndDisplay);
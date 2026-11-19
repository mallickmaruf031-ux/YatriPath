'use strict';
/* TRANSPORT TYPES. Names/labels for Flights, Trains and Buses, plus the TRANSPORT registry.
   Each transport type then fills its own settings from scripts/transport/<type>/ . */
const PLU={multi:'Multi Mode',flight:'Flights',train:'Trains',bus:'Buses'},SUB={multi:'Combined journeys',flight:'India & worldwide',train:'Stations across India',bus:'India only'},CABINS=['Economy','Premium Economy','Business','First'];
const MPIC={multi:'multi',flight:'plane',train:'train',bus:'bus'};
const MODES={bus:{n:'Bus'},train:{n:'Train'},flight:{n:'Flight'},multi:{n:'Multi Mode'}};
/* Filled in by scripts/transport/bus, train and flight. Shared pages read their behaviour from here. */
const TRANSPORT={bus:{},train:{},flight:{},multi:{}};

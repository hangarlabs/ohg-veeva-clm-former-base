import slide_ohg_base_example from '../../ohg_base_example/assets/scripts/config';
import slide_ohg_base_second_example from '../../ohg_base_second_example/assets/scripts/config';

'use strict';

//Use this file for any data, helpers or partial strings you want to use in your slide .hbs files

exports.data = {
   global: {
      prefix: 'my_prefix'
   },
   slides: {
      slide_ohg_base_example: slide_ohg_base_example,
      slide_ohg_base_second_example: slide_ohg_base_second_example
   }
};

exports.partials = {
   // footer: '<footer>the end</footer>'
};

exports.helpers = {
   // capitals: function(str) {
   //    return str.toUpperCase();
   // }
};

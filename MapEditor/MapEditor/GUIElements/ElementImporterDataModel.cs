using MapEditor.Elements;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MapEditor.GUIElements
{
    class ElementImporterDataModel
    {
        public string ID { get; set; }

        public string Name { get; set; }

        public ElementLevel Level { get; set; }

        public bool Passable { get; set; }

        public string ImageURI { get; set; }

    }
}

using MapEditor.Elements;
using MapEditor.GUIElements.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Media.Imaging;

namespace MapEditor.GUIElements
{
    class TileNPC : TileElement<NPC>, IScriptedObject
    {
        public TileNPC()
            : base()
        {

        }

        public TileNPC(NPC def, ElementDefinition elementDef)
            : base(def)
        {
            this.ImageSource = new BitmapImage(def.PreviewImageUri);
            this.ElementDefinition = elementDef;
        }

        public ElementDefinition ElementDefinition { get; private set; }

        public override string Tooltip
        {
            get
            {
                StringBuilder builder = new StringBuilder();

                if (Element != null)
                {
                    builder.AppendFormat("[ID] = {0} - ", Element.ID);
                    builder.AppendFormat("[Name] = {0}", Element.Name);

                }

                return builder.ToString();
            }
        }

        public override void postDelete(MapTile destination)
        {
            // Check for old definitions

            if (destination.Tile.Data != null)
            {
                var removeList = new LinkedList<KeyValuePair<string, string>>();
                foreach (var item in destination.Tile.Data)
                {
                    if (item.Key == "NPC")
                    {
                        removeList.AddLast(item);
                    }
                }

                foreach (var item in removeList)
                {
                    destination.Tile.Data.Remove(item);
                }

            }

        }

        public override void postPaint(MapTile destination)
        {
            // Set NPC-Flag:
            postDelete(destination);

            if (destination.Tile.Data == null)
            {
                destination.Tile.Data = new System.Collections.ObjectModel.ObservableCollection<KeyValuePair<string, string>>();
            }

            destination.Tile.Data.Add(new KeyValuePair<string, string>("NPC", this.Element.ID));
        }
    }
}

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
    class TilePrefab : TileElement<Prefab>
    {
        /// <summary>
        /// The Tooltip of the Element
        /// </summary>
        public override string Tooltip
        {
            get
            {
                StringBuilder builder = new StringBuilder();

                builder.Append("Prefab - ");
                if (Element != null)
                {

                    builder.AppendFormat("[ID] = {0}", Element.ID);
                }

                return builder.ToString();
            }
        }

        public TilePrefab()
            : base()
        {

        }

        public TilePrefab(Prefab def)
            : base(def)
        {
            this.ImageSource = new BitmapImage(def.PreviewImageUri);
        }


    }
}

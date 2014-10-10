using MapEditor.Elements;
using MapEditor.GUIElements.Base;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace MapEditor.GUIElements
{
    class TileImage : TileElement<ElementDefinition>
    {

        /// <summary>
        /// The Tooltip of the Element
        /// </summary>
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

        public TileImage()
            : base()
        {
        }

        public TileImage(ElementDefinition def)
            : base(def)
        {
            this.ImageSource = def.ImageSource;

        }



    }
}

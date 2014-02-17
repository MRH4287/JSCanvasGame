using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MapEditor.Elements
{
    /// <summary>
    /// The "Hight" of an Element wothin a Tile
    /// </summary>
    enum ElementLevel : int
    {
        /// <summary>
        /// Floor Level. Player walks over it.
        /// </summary>
        Bottom = 0,
        /// <summary>
        /// Same Level a the Player.
        /// </summary>
        Middle = 1,
        /// <summary>
        /// Level over the Player.
        /// </summary>
        Top = 2
    }
}

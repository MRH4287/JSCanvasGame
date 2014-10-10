using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;

namespace MapEditor.GUIElements
{
    /// <summary>
    /// Element used for Tile Grouping
    /// </summary>
    public class ExtGrid : Grid, INotifyPropertyChanged
    {

        #region Property

        /// <summary>
        /// Get the Connected Element for Display
        /// </summary>
        /// <param name="obj">The Instance to get the Value</param>
        /// <returns>Value</returns>
        public static string GetConnectedElement(DependencyObject obj)
        {
            return (string)obj.GetValue(ConnectedElementProperty);
        }

        /// <summary>
        /// Set the Connected Element for Display
        /// </summary>
        /// <param name="obj">The Instance to set the Value</param>
        /// <param name="value">Value to set</param>
        public static void SetConnectedElement(DependencyObject obj, string value)
        {
            obj.SetValue(ConnectedElementProperty, value);
        }

        // Using a DependencyProperty as the backing store for ConnectedElement.  This enables animation, styling, binding, etc...
        public static readonly DependencyProperty ConnectedElementProperty =
            DependencyProperty.RegisterAttached("ConnectedElement", typeof(string), typeof(ExtGrid), new PropertyMetadata(null));


        /// <summary>
        /// The Element to display
        /// </summary>
        public string ConnectedElement 
        {
            get
            {
                return GetConnectedElement(this);
            }
            set
            {
                SetConnectedElement(this, value);

                if (PropertyChanged != null)
                {
                    PropertyChanged(this, new PropertyChangedEventArgs("ConnectedElement"));
                }
            }
        }

        /// <summary>
        /// Triggered when a Property is changed
        /// </summary>
        public event PropertyChangedEventHandler PropertyChanged;

        #endregion

        static string[] GroupList = new string[] {
            "CommandTileHolder",
            "PrefabTileHolder",
            "TileHolder",
            "ScriptedTileHolder"
        };


        public ExtGrid()
        {
            this.MouseLeftButtonUp += ExtGrid_MouseLeftButtonUp;
            this.Cursor = Cursors.Hand;

        }

        void ExtGrid_MouseLeftButtonUp(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            if (!String.IsNullOrWhiteSpace(this.ConnectedElement))
            {
                this.UpdateVisibility(VisualTreeHelper.GetParent(this), this.ConnectedElement);
            }
        }

        private void UpdateVisibility(DependencyObject parent, string name)
        {
            if (parent == null)
            {
                return;
            }

            int childCount = VisualTreeHelper.GetChildrenCount(parent);

            for (int i = 0; i < childCount; i++)
            {
                var element = VisualTreeHelper.GetChild(parent, i) as FrameworkElement;
                if (element == null)
                {
                    continue;
                }

                if (GroupList.Contains(element.Name))
                {
                    if (element.Name != name)
                    {
                        element.Visibility = System.Windows.Visibility.Collapsed;
                    }
                    else
                    {
                        if (element.Visibility != System.Windows.Visibility.Visible)
                        {
                            element.Visibility = System.Windows.Visibility.Visible;
                        }
                        else
                        {
                            element.Visibility = System.Windows.Visibility.Collapsed;
                        }
                    }
                }
               




            }

        }


    }
}
